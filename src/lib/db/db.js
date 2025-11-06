import { db } from './db-conn.js';
import chalk from 'chalk';
// add-tasks
const insertStmt = db.prepare(`
  INSERT INTO tasks_queue (uuid, command, state, attempts, max_tries, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export function insertNewTaskIntoDb(task = {
    uuid, cmd, state, max_tries, priority
}) {

    try {
        // commands in tasks_queue
        let commands = db.get(`
            SELECT cmd FROM tasks_queue;
        `);


        // uuids in tasks_queue,
        let uuids = db.get(
            `SELECT uuid FROM tasks_queue;`
        )

        // criteria for checking duplicate commands, & uuid.
        if (commands.includes(task.cmd) && uuids.includes(task.uuid)) {
            console.error(chalk.redBright(`${task.cmd} already exists`));
        } else {
            insertStmt.run(
                task.uuid,
                task.cmd,
                task.state,
                task.max_tries,
                Date.now(),
                Date.now(),
                task.priority
            );
        }
    } catch(err) {
        throw new Error(chalk.bgRed(err));
    }
}

