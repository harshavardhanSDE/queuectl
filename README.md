# queuectl (Node.js)
cli application for managing background jobs using workers.

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