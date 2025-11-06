import { insertNewTaskIntoDb } from '../../db/db.js';
import chalk from 'chalk';


export const command = "enqueue <job>";
export const describe = "Enqueue a task to the task queue";
export const builder = {
    target : {
        alias: "add",
        type: "string",
        describe: "Enqueue a task to the task queue",
    }
};

export const handler = (arg) =>{
    arg = JSON.parse(arg.job);
    try {
        // checking for missed values
        if ( !arg.id || !arg.command) {
            console.error(chalk.redBright("Missing required tasks property"));
        } else {

            insertNewTaskIntoDb(
                {
                    uuid: arg.id,
                    cmd: arg.command,
                    state: `${arg.state ? arg.state : "pending"}`,
                    attempts: `${arg.attempts ? arg.attempts : 0}`,
                    max_tries: `${arg.max_tries ? arg.max_tries : 3}`,
                    priority: `${arg.priority ? arg.priority : 0}`,
                }
            );
        }


    } catch (err) {
        console.log(chalk.redBright.bold.redBright(err));
    }
}