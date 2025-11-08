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
                Date.now(),
                Date.now(),
                task.priority
            );
            console.log(chalk.bgGreen(`Task ${task.uuid} enqueued!`));
        }
    } catch(err) {
        throw new Error(chalk.bgRedBright(err));
    }
}

// deleting all the rows

export function deleteRows(){
    try {
            db.prepare(`DELETE FROM tasks_queue`).all();
            console.log(chalk.bgGreen("Deleted all tasks."))
    } catch(err) {
        console.error(chalk.bgRed(`Failed to delete all tasks: error - ${err.message}`));
    }
}


// function for getting all the task with certain, state.
export function getRows(value, ...cols) {
    try {
        return db.prepare(`SELECT ${ cols.includes("all") ? "*" : cols.join(", ")} FROM tasks_queue WHERE state = ?;`)
            .all(value)
            .map(res => res);
    } catch( error ) {
        console.error(chalk.bgRed(`Failed to get rows with: ${[...cols]}`));
    }
}

export function getAllRows(){
    try {
        return db.prepare(`SELECT * FROM tasks_queue`).all().map(res => res);
    } catch( error ) {
        console.error(chalk.bgRed(`Failed to get rows`));
    }
}


export function update(col, value, id) {
    try {
        db.prepare(`UPDATE tasks_queue SET ${col.toLowerCase()} = ? WHERE uuid = ?`).all(value, id);
    } catch( error ) {
        console.error(chalk.bgRedBright(error));
    }
}

