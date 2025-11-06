import { insertNewTaskIntoDb } from '../../db/db.js';

export const command = "enqueue";
export const describe = "Enqueue a task to the task queue";
export const builder = {
    target : {
        alias: "eq",
        type: "string",
        describe: "Enqueue a task to the task queue",
        choices: ["-t"],
        default: "add"
    }
};

export const handler = (arg = Object()) =>{
    insertNewTaskIntoDb(arg);
}