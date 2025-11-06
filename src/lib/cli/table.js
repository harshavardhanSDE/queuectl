import { Table } from 'console-table-printer';
import chalk from 'chalk';


let data = [
    {
        rank: 1,
        player: chalk.cyan("named person"),
    },
    {
        rank: 1,
        player: chalk.bgCyan("harsha vardhan")
    },  {
        rank: 1,
        player: chalk.bgBlue("named person"),
        state: chalk.green("active")
    },  {
        rank: 1,
        player: chalk.bgRed("named person")
    },
]

let statTable = new Table();
data.forEach(row => {
    statTable.addRow(row);
})
statTable.printTable();