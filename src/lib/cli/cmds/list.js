import { db } from "../../db/db-conn.js";
import { listTasks } from "../table.js";
import chalk from "chalk";

let colorMap = {

};


export const command = "list";
export const describe = "list all tasks";
export const builder = {

}

export const handler = () => {
    try {
        let tasks = db.prepare(`SELECT * FROM tasks_queue`).all().map(res => res);
        if (tasks.length === 0) {
            console.log(chalk.redBright.bold.redBright("No tasks found"));
        } else {
            listTasks(tasks).printTable();
        }
    } catch (err) {
        console.error(chalk.redBright.bold.redBright(err));
    }
}