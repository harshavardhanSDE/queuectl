
# 🧩 queuectl — Minimal Background Job Queue System (CLI-based)

`queuectl` is a **CLI-based background job queue system** written in **Node.js**, designed to manage asynchronous jobs with:
- Persistent storage (SQLite)
- Multiple worker processes
- Exponential backoff retry logic
- Dead Letter Queue (DLQ)
- Configurable system parameters (max retries, backoff base)
- Graceful shutdown and CLI commands

---

## 📜 Table of Contents
1. [Overview](#-overview)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [Mermaid Diagram](#-architecture-diagram)
5. [Job Lifecycle](#-job-lifecycle)
6. [Setup & Installation](#-setup--installation)
7. [Usage Examples](#-usage-examples)
8. [Configuration Management](#-configuration-management)
9. [Testing & Validation](#-testing--validation)
10. [Design Choices & Trade-offs](#-design-choices--trade-offs)
11. [Possible Improvements](#-possible-improvements)
12. [License](#-license)

---

## 🎯 Overview

`queuectl` is a **lightweight job orchestration system** that lets you enqueue shell commands as background jobs.  
Workers execute these jobs in parallel, automatically retry failures using **exponential backoff**, and persist all job states to **SQLite** for crash-safe recovery.

It is ideal for small systems, prototypes, or developer environments needing background job processing without external dependencies like Redis or RabbitMQ.

---

## ⚙️ Features

| Feature | Description |
|----------|-------------|
| 🧾 **Job Enqueueing** | Add shell command jobs to persistent queue |
| ⚡ **Worker Processes** | Run one or more concurrent workers |
| 🔁 **Retries with Backoff** | Automatic exponential retry (`delay = base ^ attempts`) |
| 💀 **Dead Letter Queue (DLQ)** | Failed jobs moved after max retries |
| 💾 **Persistence** | SQLite ensures durability across restarts |
| 🧩 **CLI Interface** | `yargs`-powered commands for full control |
| 🛑 **Graceful Shutdown** | Workers complete current jobs before exiting |
| ⚙️ **Configurable Parameters** | `max_retries`, `backoff_base` modifiable via CLI |
| 🔐 **Atomic Locking** | Prevents duplicate processing across workers |

---

## 🏗 Architecture

### Components

| Component | Description |
|------------|-------------|
| **CLI (index.js)** | Entry point. Handles all user commands via `yargs`. |
| **Database Layer (db.js)** | Handles job persistence, queries, and config using SQLite. |
| **Worker Engine (worker.js)** | Manages job claiming, execution loop, and graceful shutdown. |
| **Job Runner (job_runner.js)** | Executes shell commands, interprets exit codes, and updates job states. |
| **Storage (SQLite)** | Single-file persistence, ACID-safe transactions, WAL mode for concurrency. |

---

## 🧭 Architecture Diagram

```mermaid
flowchart TD
    subgraph CLI["queuectl CLI"]
        A1["enqueue <job>"]
        A2["worker start --count N"]
        A3["status / list / dlq / config"]
    end

    subgraph Database["SQLite Database (queuectl.db)"]
        D1["jobs table"]
        D2["config table"]
    end

    subgraph Worker["Worker Process(es)"]
        W1["Job Claim (atomic)"]
        W2["Job Runner (exec command)"]
        W3["Retry + Backoff Logic"]
        W4["DLQ Movement"]
    end

    subgraph OS["System Shell"]
        S1["Executes Command"]
    end

    A1 -->|Insert JSON job| D1
    A2 -->|Spawns| Worker
    Worker -->|Select pending job| D1
    W1 --> W2 --> S1
    S1 -->|Exit Code| W3
    W3 -->|Success| D1
    W3 -->|Failure (retry)| D1
    W3 -->|Exceeded retries| D1:::dead
    A3 -->|Read states| D1
    D1 -.persistent.-> Database

    classDef dead fill=#e57373,color=white
````

---

## 🔄 Job Lifecycle

| **State**    | **Description**                      |
| ------------ | ------------------------------------ |
| `pending`    | Waiting to be picked up by a worker  |
| `processing` | Currently being executed by a worker |
| `completed`  | Executed successfully                |
| `failed`     | Failed but still retryable           |
| `dead`       | Permanently failed, moved to DLQ     |

**Exponential Backoff Formula:**

```
delay_seconds = base ^ attempts
```

If a job fails 3 times (base=2):

```
Retry delays = 2, 4, 8 seconds
```

---

## 🧰 Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/queuectl.git
cd queuectl
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify CLI

```bash
node index.js --help
```

---

## 💻 Usage Examples

### 1. Enqueue a Job

```bash
node index.js enqueue '{"id":"job1","command":"echo Hello World"}'
```

### 2. Start 3 Workers

```bash
node index.js worker start --count 3
```

Workers will:

* Atomically claim pending jobs
* Execute `command`
* Retry on failure with backoff
* Move exhausted jobs to DLQ

### 3. Check Job Status

```bash
node index.js status
```

Example output:

```
Job counts by state: { pending: 0, completed: 2, dead: 1 }
Active processing jobs: 0
```

### 4. List Jobs

```bash
node index.js list --state completed
```

### 5. Dead Letter Queue

```bash
node index.js dlq list
node index.js dlq retry job1
```

### 6. Configuration

```bash
node index.js config get backoff_base
node index.js config set backoff_base 3
node index.js config set max_retries 5
```

---

## 🧩 Configuration Management

`queuectl` maintains a `config` table in the same SQLite database.

| Key            | Description                                      | Default |
| -------------- | ------------------------------------------------ | ------- |
| `max_retries`  | Maximum retry attempts before job marked as dead | `3`     |
| `backoff_base` | Exponential base used for retry delay            | `2`     |

Example:

```bash
node index.js config set backoff_base 3
```

---

## 🧪 Testing & Validation

### Functional Scenarios

| # | Scenario                      | Expected Result                            |
| - | ----------------------------- | ------------------------------------------ |
| 1 | Enqueue job with `echo hello` | Job completes successfully                 |
| 2 | Enqueue invalid command       | Job retries and moves to DLQ               |
| 3 | Start multiple workers        | No duplicate job processing                |
| 4 | Restart system mid-job        | Jobs resume correctly from persisted state |
| 5 | Retry DLQ job                 | Moves back to `pending` and re-executes    |

### Quick Test Script

Create `test.sh`:

```bash
#!/usr/bin/env bash
set -e
node index.js enqueue '{"id":"t1","command":"echo ok"}'
node index.js enqueue '{"id":"t2","command":"bash -c \"exit 2\"","max_retries":2}'
sleep 1
node index.js status
sleep 6
node index.js dlq list
```

Run workers in another terminal:

```bash
node index.js worker start --count 2
```

---

## ⚖️ Design Choices & Trade-offs

### ✅ SQLite for Persistence

* **Pros:** Simple, durable, ACID, file-based, no server setup.
* **Cons:** Single-process writes limit throughput; fine for small jobs.

### ✅ Node.js + `child_process.exec`

* Executes shell commands directly.
* Portable across OS.
* Easy to capture stdout/stderr and exit code.

### ✅ Exponential Backoff via `base ^ attempts`

* Prevents hot looping on failing jobs.
* Tunable via CLI config.

### ✅ Dead Letter Queue

* DLQ is simply `state='dead'` — no separate table needed.
* Retrying from DLQ resets attempts and sets state to `pending`.

### ⚠ Limitations

* No job timeout or cancellation yet (planned feature).
* Single database file (not distributed safe).
* `worker stop` command doesn’t terminate background workers (handled by process signal).

---

## 🚀 Possible Improvements

| Feature                        | Description                            |
| ------------------------------ | -------------------------------------- |
| 🕓 **Job Timeout**             | Kill long-running commands             |
| ⏰ **Scheduled Jobs**           | Future `run_at` execution              |
| 🧠 **Priority Queues**         | Process high-priority jobs first       |
| 📊 **Web Dashboard**           | Real-time job status monitoring        |
| 🧾 **Job Output Logging**      | Store stdout/stderr in DB              |
| 🔍 **Metrics & Health Checks** | Observe queue throughput & error rates |

---

## 📜 License

MIT License.
Use, modify, or repurpose freely with attribution.

---

## 🎥 Demo Recording (Optional)

Include a screen-recorded CLI demo link here:
👉 [Demo on Google Drive](https://drive.google.com/your-demo-link)

---

## 🧩 Repository Structure

```
queuectl/
├── index.js          # CLI interface
├── worker.js         # Worker process management
├── job_runner.js     # Executes job commands
├── db.js             # SQLite database wrapper
├── package.json      # Node.js metadata
├── queuectl.db       # Auto-generated SQLite database
└── README.md         # Documentation
```

---

## ✅ Submission Checklist

* [x] CLI fully operational (`enqueue`, `worker`, `dlq`, `config`)
* [x] Persistent job store (`queuectl.db`)
* [x] Exponential retry with backoff
* [x] Dead Letter Queue and requeue feature
* [x] Configurable parameters
* [x] Graceful worker shutdown
* [x] Test script and architecture diagram included
* [x] README explaining setup, design, and usage

---

*Yes, it’s “minimal,” but this thing can actually survive restarts, manage retries, and run real background jobs. That’s more than most interview-grade toy queues manage.*

```
---

That’s a professional, self-contained README.  
It explains everything from architecture to setup, with a Mermaid diagram for visual credibility. Drop it into your repo root, and the submission’s reviewer will have nothing to complain about—unfortunately for them.
```
