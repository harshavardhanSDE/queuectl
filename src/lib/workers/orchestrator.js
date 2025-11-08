
import { getRows, update } from "../db/db.js";
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import chalk from "chalk";


// SHARED STATE
// for tracking all pending tasks,
let TASKS_QUEUE = new Set();

// Dead letter queue tasks
let DLQ_TASKS = new Set();

// Retry
let RETRY = new Set();
// Workers pool
let WORKERS_QUEUE = new Set();

// scheduled tasks for future execution
let SCHEDULED_TASKS = new Set();

function createWorker() {
    return {
        id: `worker-${Date.now()}`,
        // command supplied via -> postMessage() from orchestrator threads.
        worker: new Worker(path.resolve("src/lib/workers/worker.js")),
        current_task: null, // true | false
        available: true,
    }
}

// assigning task
function assignTasks() {
    for ( const worker of WORKERS_QUEUE ) {

        // checking if the current worker is busy
        if ( !worker.available ) continue;

        // getting the next task in TASK_QUEUE
        const nextTask = TASKS_QUEUE.values().next().value;
        if ( !nextTask ) break; // if no tasks available

        TASKS_QUEUE.delete(nextTask);
        worker.current_task = nextTask;
        worker.available = false;
        worker.worker.postMessage(nextTask);
        // updating task status for persistence
        update("state", "processing", nextTask.uuid);
    }
}

const RETRY_META = new Map();

function retry(MAX_RETRIES, BASE_DELAY, TaskID) {
    const failedTask = Array.from(RETRY).find( task => task.uuid === TaskID);
    if (!failedTask) {
        console.error(chalk.red(`Task ${TaskID} not found in DLQ.`));
        return;
    }

    const meta = RETRY_META.get(TaskID) || {attempts: 0};
    const nextAttempt = meta.attempts + 1;

    if ( nextAttempt > MAX_RETRIES ) {
        console.error(chalk.redBright(`Task ${TaskID} retried ${MAX_RETRIES}`));
        RETRY.delete(TaskID);
        RETRY_META.delete(TaskID);
        DLQ_TASKS.add(TaskID);
        update("state", "dead", TaskID);
        return;
    }

    const delay = BASE_DELAY * Math.pow(2, nextAttempt - 1);

    console.log(
        chalk.yellow(
            `Retrying task ${TaskID} in ${(delay / 1000).toFixed(1)}s (attempt ${nextAttempt}/${MAX_RETRIES})`
        )
    );

    const timeoutId = setTimeout(() => {
        RETRY.delete(failedTask);
        TASKS_QUEUE.add(failedTask);
        RETRY_META.set(TaskID, { attempts: nextAttempt });
        assignTasks(); // trigger task assignment again
    }, delay);

    RETRY_META.set(TaskID, { attempts: nextAttempt, timeoutId });
    update("attempts", nextAttempt, TaskID);
}


// on worker events
function onWorkerEvents( worker ) {
    const currentWorker = worker;


    // on SUCCESSFUL completion of given command
    currentWorker.worker.on("message", ( message ) => {
        if ( message.status ) {
            console.log(chalk.greenBright(message.stdout));
            update("state", "completed", currentWorker.current_task.uuid);
        } else {
            console.error(chalk.redBright(message.stdout));
            update("state", "failed", currentWorker.current_task.uuid);
            RETRY.add(currentWorker.current_task); // add full task object
            retry(currentWorker.current_task.max_tries, 1000, currentWorker.current_task.uuid);
        }
    }) // message

    currentWorker.worker.on("exit", (code) => {
        console.log(code);
        if ( code === 0) {

            console.log(chalk.bgGreen(`Executed successfully.`));


            // console.log(currentWorker);
            if ( currentWorker.current_task) {
                update("state", "completed", currentWorker.current_task.uuid);
            }
        } else {
            console.log(chalk.bgRed(`Failed with code: [${code}]`));
            // IMPLEMENT RETRY logic
            update("state", "failed", currentWorker.current_task.uuid);
            if ( currentWorker.current_task) {
                update("state", "failed", currentWorker.current_task.uuid);
                RETRY.add(currentWorker.current_task.uuid);
                retry(currentWorker.current_task.max_tries, 1000, currentWorker.current_task.uuid);
            }
        }

        currentWorker.available = true;
        currentWorker.current_task = null;
        assignTasks();
    }) // exit

    currentWorker.worker.on("error", (error) => {
        console.log(chalk.bgRed(` Error: [${error.message}]`));
        update("state", "failed", currentWorker.current_task.uuid);
        if ( currentWorker.current_task) RETRY.add(currentWorker.current_task.uuid);
        currentWorker.available = true;
        assignTasks();
    })
}

export function orchestrateWorkers(MAX_WORKERS) {
    // getting all pending tasks from the db
    const pendingTasks = getRows("pending", "all");
    // console.log(pendingTasks);

    // adding all the pending tasks to TASKS_QUEUE; INTERNAL --
    for ( const task of pendingTasks ) {
        TASKS_QUEUE.add(task);
    }

    // console.log(TASKS_QUEUE.size);

    for ( let _  = 0; _ < MAX_WORKERS; _++) {
        const worker = createWorker();
        onWorkerEvents(worker);
        WORKERS_QUEUE.add(worker);
    }

    // console.log(WORKERS_QUEUE);

    assignTasks();
    console.log(chalk.bgBlue(`Orchestrator started with ${MAX_WORKERS} workers.`))
}


export function stopWorkers(){
    for ( const worker of WORKERS_QUEUE ) {
        worker.worker.terminate();
        console.log(chalk.green(`Stopped worker[${worker.id}`));
    }
    WORKERS_QUEUE.clear();
}



