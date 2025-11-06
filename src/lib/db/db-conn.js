import { DatabaseSync } from 'node:sqlite';
import path from 'path';

/*
* Defaults to persistent storage @tasks.db
* @params
*/



// for persistent storage of tasks.
export const db = new DatabaseSync(path.resolve("tasks.db"));


export const initDB = (typeOfDB = String()) => {
    if (typeOfDB == null) {
        return new DatabaseSync(":memory:");
    } else if (typeOfDB === "persistent") {
        return new DatabaseSync();
    } else {
        return new DatabaseSync(":memory:");
    }
}