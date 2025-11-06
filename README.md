# queuectl (Node.js)
cli application for managing background jobs using workers.

## Table of contents
1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Architecture](#architecture)
   1. [Orchestrator](#orchestrator)
   2. [Worker](#worker-slave)
4. [Custom config](#custom-config)
5. [Logging](#logging)
6. [Data storage](#data-storage-persistence-temporary)
7. [Task Queue schema](#task-queue-schema)
8. [Caveats](#caveats)
9. [End note](#end-note)

## Requirements
- [ ] Working CLI application.
- [x] Persistent job storage - Sqlite (node.js API).
- [ ] Multiple worker support.
- [ ] Retry mechanism with exponential backoff.
- [ ] Dead letter Queue.
- [x] Clean cli interface ( commands & help texts ) - `yargs` for command building, and `chalk` for visual semantic outputs.
- [x] Code separated with clear separation of concerns.
- [ ] Minimal testing.
- [ ] job timeout handling
- [ ] Priority queues
- [ ] Schedules/delayed jobs
- [ ] Job output logging - Pino
- [ ] Metrics & Execution stats
- [ ] Web dashboard for monitoring
- [x] All required commands functional
- [ ] Jobs persist after restart



## Installation
Get the github repository by cloning the repo, as below
```bash
git clone https://github.com/harshavardhanSDE/queuectl.git
```
then, 
```bash
npm i
# --- or ---
pnpm install
```


## Architecture
The `queuectl` uses master - worker (slave) architecture for spawning, monitoring, and managing workers, and tasks.
Where there is a `master` - **Orchestrator** is the central entity controlling the workers and executing the queued tasks.
Other than `worker` and `Orchestrator`, there is a number of queues implemented to keep track of all the workers and tasks completed.

### Orchestrator
Orchestrator is the managing entity responsible for 
### Worker (Slave)
### Task Queue
### Rejected Queue
### Dead Letter Queue
### Worker Queue

## Custom config
- The Orchestrator along with command line option, can be given set of options via file `queuectl.config.json`,

## Logging
`pino` is used to logging,

## Data storage (Persistence/ Temporary)
The tool is built in such a way to be useful in both preferred way for storing tasks, with default option for storing tasts in a `db` file called `tasks.db`, or any other name specified by the user.


## Task Queue Schema
| Field      	          | Types    	| Default    	|
|-----------------------|----------	|------------	|
| uuid (REQUIRED)     	 | INTEGER  	| no         	|
| cmd(REQUIRED)      	  | TEXT     	| pwd        	|
| state      	          | TEXT     	| "pending"  	|
| attempts   	          | INTEGER  	| 0          	|
| max_tries  	          | INTEGER  	| 3          	|
| create_at  	          | DATETIME 	| DATE.now() 	|
| updated_at 	          | DATETIME 	| DATE.now() 	|
| priority   	          | INTEGER  	| 0          	|

## Caveats
1. The mechanism for checking the uniqueness of tasks is rudimentary, and will likely to be updated later for further stability.

## End note
A sincere thanks to the _flam_ team for setting up the assignment, I thoroughly enjoyed building it from scratch. And learned quite a lot.



node --experimental-sqlite src/cli.js enqueue '{"id": "id4", "command": "echo `cat somhing`", "max_tries" : "4"}'