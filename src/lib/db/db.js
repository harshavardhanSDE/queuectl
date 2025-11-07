import { db } from './db-conn.js';
import chalk from 'chalk';


// add-tasks
const insertStmt = db.prepare(`
  INSERT INTO tasks_queue (uuid, command, state, attempts, max_tries, created_at, updated_at, priority)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export function insertNewTaskIntoDb(task = {
    uuid, cmd, state, attempts, max_tries, priority
}) {

    try {
        // commands in tasks_queue
        let commands = db.prepare(`SELECT command FROM tasks_queue;`).all().map(res => res.cmd);

        // uuids in tasks_queue,
        let uuids = db.prepare(`SELECT uuid FROM tasks_queue;`).all().map(res => res.uuid);


        // criteria for checking duplicate commands, & uuid.
        if (commands.includes(task.cmd) || uuids.includes(task.uuid)) {
            console.error(chalk.bgRed(`Tasks with ${ commands.includes(task.cmd) ? task.cmd : task.uuid } already exists`));
        } else {
            insertStmt.run(
                task.uuid,
                task.cmd,
                task.state,
                task.attempts,
                task.max_tries,
                new Date(Date.now()).toLocaleString(),
                new Date(Date.now()).toLocaleString(),
                task.priority
            );
            console.log(chalk.bgGreen(`Task ${task.uuid} enqueued!`));
        }
    } catch(err) {
        throw new Error(chalk.bgRedBright(err));
    }
}

// deleting all the rows

export function deleteRows(...condition){
    try {
        if ( !condition ) {
            db.prepare(`DELETE FROM tasks_queue`).all();
            console.log(chalk.bgGreen("Deleted all tasks."))
        } else {

        }
    } catch(err) {
        console.error(chalk.bgRed(`Failed to delete all tasks: error - ${err.message}`));
    }
}

