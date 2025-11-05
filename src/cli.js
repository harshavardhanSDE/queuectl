#!/usr/bin/env node


import yargs from 'yargs';
import {hideBin} from "yargs/helpers";
import chalk from "chalk";


const argv = yargs(hideBin(process.argv))
    .command('add <task>', 'Add a new task', (yargs) => {
        return yargs.positional('task', {
            describe: 'Task description',
            type: 'string'
        });
    }, (argv) => {
        console.log( chalk.green(`Adding new task: ${argv.task}`));
    })
    .command('list', 'List all tasks', () => {
        console.log('Listing tasks...');
        // Code to list tasks here
    })
    .demandCommand(1, chalk.blue('You need at least one command before moving on'))
    .help()
    .argv;