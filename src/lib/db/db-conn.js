import { DatabaseSync } from 'node:sqlite';
/*
* Defaults to persistent storage @tasks.db
* @params
*/
export const db = new DatabaseSync(":memory:");

export const initDB = (typeOfDB = String()) => {
    if (typeOfDB == null) {
        return new DatabaseSync(":memory:");
    } else if (typeOfDB === "persistent") {
        return new DatabaseSync();
    } else {
        return new DatabaseSync(":memory:");
    }
}