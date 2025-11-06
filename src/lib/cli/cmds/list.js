import { db } from "../../db/db-conn.js";
import { consoleTable } from "../table.js";
import chalk from "chalk";

let colConfig = [
        {
            name: "Id",
            alignment: "center",
        },
        {
            name: "Command",
            alignment: "center",
        },
        {
            name: "State",
            alignment: "center",
        },
        {
            name: "Attempts",
            alignment: "center",
        },
        {
            name: "Max_Tries",
            alignment: "center",
        },
        {
            name: "Created_At",
            alignment: "center",
        },
        {
            name: "Updated_At",
            alignment: "center",
        },
        {
            name: "Priority",
            alignment: "center",
        },
    ];
let colorMap = {
    pending: "\x1b[34m\t",
    processing: "\x1b[33m",
    completed: "\x1b[32m\t",
    failed: '\x1b[31m\t',
    dead: "\x1b[41m\t"
}


export const command = "list [state]";
export const describe = "list all tasks";
export const builder = {

}

export const handler = (arg) => {
    try {
        if ( arg.state && arg.state!= "all" ){

            // Getting only the tasks with given state
            let tasks = db.prepare(`SELECT * FROM tasks_queue WHERE state = ?;`).all(arg.state).map(task => task);

            // Printing the tasks with given status,
            if ( tasks.length === 0) {
                console.log(chalk.yellow(`No tasks found with ${ chalk.bgYellow(arg.state) } state.`));
            } else {
                consoleTable(tasks, colConfig, colorMap, `${arg.state} Tasks`).printTable();
            }

        } else {

            // Getting all available tasks.
            let tasks = db.prepare(`SELECT * FROM tasks_queue`).all().map(res => res);

            if (tasks.length === 0) {
                console.log(chalk.redBright.bold.redBright("No tasks found"));
            } else {
                consoleTable(tasks, colConfig, colorMap, "Tasks Table").printTable();
            }

        }

    } catch (err) {
        console.error(chalk.redBright.bold.redBright(err));
    }
}