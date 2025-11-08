import {db} from "./db-conn.js";


// tasks_queue stores all the added tasks, with default status to pending.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks_queue (
    uuid TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER,
    max_tries INTEGER,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    priority INTEGER
  ); 

    CREATE TRIGGER IF NOT EXISTS update_time_stamps
      AFTER UPDATE OF state ON tasks_queue
      FOR EACH ROW
      WHEN NEW.state != OLD.state
      BEGIN 
          UPDATE tasks_queue
          SET updated_at = strftime('%s', 'now')
          WHERE uuid = OLD.uuid;
      END;
      
`);



