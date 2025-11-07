import { db} from "../db/db-conn.js";
import { Worker } from 'node:worker_threads';
import path from 'node:path';

// for tracking all pending tasks,
let TASKS_QUEUE = new Set();

// Dead letter queue tasks
let DLQ_TASKS = new Set();

// Workers pool
let WORKERS_QUEUE = new Set();

// scheduled tasks for future execution
let SCHEDULED_TASKS = new Set();

// Maximum workers to spawn
let MAX_WORKERS = 3;


// getting all tasks from the db
// db.prepare('SELECT * FROM tasks_queue ORDER BY priority DESC')
//     .all()
//     .map( task => {
//         TASKS_QUEUE.add(task)
//     });
//
// TASKS_QUEUE.forEach((task) => {
//     console.log(task);
// }

const worker1 = new Worker(path.resolve('src/lib/workers/worker.js'), {
    workerData: {
        command: "echo 'from worker 1'"
    }
});

worker1.on('message', function (message) {
    console.log(message.stdout);
})
worker2.on('message', function (message) {
    console.log(message.stdout);
})
worker3.on('message', function (message) {
    console.log(message.stdout);
})
//
// worker.on('error', function (error) {
//     console.error(error);
// })
//
// worker.on('exit', function (code) {
//     console.log(code);
// })


