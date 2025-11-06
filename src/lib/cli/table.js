import { Table } from 'console-table-printer';
import chalk from 'chalk';


export function listTasks(tasks) {

    let tasksTable = new Table({
        title: "Tasks",
        columns: [
            {
                name: "Id",
                alignment: "center",
                color: "green",
            },
            {
                name: "Command",
                alignment: "center",
                color: "green",
            },
            {
                name: "State",
                alignment: "center",
                color: "green",
            },
            {
                name: "Attempts",
                alignment: "center",
                color: "green",
            },
            {
                name: "Max_Tries",
                alignment: "center",
                color: "green",
            },
            {
                name: "Created_At",
                alignment: "center",
                color: "green",
            },
            {
                name: "Updated_At",
                alignment: "center",
                color: "green",
            },
            {
                name: "Priority",
                alignment: "center",
                color: "green",
            },
        ],
        colorMap: {
            pending: "\x1b[34m\t",
            processing: "\x1b[33m",
            completed: "\x1b[32m\t",
            failed: "\x1b[31m\t",
            dead: "\x1b[41m\t"
        }
    });

    tasks.forEach(task =>
        tasksTable.addRow({
            Id: task.uuid,
            Command: task.command,
            State: task.state,
            Attempts: task.attempts,
            Max_Tries: task.max_tries,
            Created_At: task.created_at,
            Updated_At: task.updated_at,
            Priority: task.priority,
        }, {
            color: `${task.state}`
        })
    );

    return tasksTable;
}
