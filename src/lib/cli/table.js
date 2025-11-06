import { Table } from 'console-table-printer';
import chalk from 'chalk';


export function consoleTable(rows, colConfig, colorMap, tableTitle) {

    let statTable = new Table({
        title: tableTitle,
        columns: colConfig,
        colorMap: colorMap
    });

    rows.forEach(task =>
        statTable.addRow({
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

    return statTable;
}
