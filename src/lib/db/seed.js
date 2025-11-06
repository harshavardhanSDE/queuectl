import {db} from "./db-conn.js";


// tasks_queue stores all the added tasks, with default status to pending.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks_queue (
    uuid INTEGER PRIMARY KEY,
    command TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER,
    max_tries INTEGER,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    priority INTEGER
  )
`);



