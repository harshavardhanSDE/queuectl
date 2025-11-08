import { orchestrateWorkers, stopWorkers} from "../../workers/orchestrator.js";
import chalk from 'chalk';
export const command = "worker [option]";
export const describe = "start/stop workers.";

export const builder = (args) => {
    args.positional("option", {
            describe: "To start/stop workers",
            type: "string",
            choices: ["stop", "start"],
            default: "start",
        })
            .option("count", {
                alias: "--c",
                describe: "set number of workers",
                type: "number",
                default: 1,
            })
};

export const handler = (argv) => {
    try {
        if (argv.option === 'start') {
            console.log(
                chalk.green(
                    `${chalk.green(argv.count)}`
                )
            );
            // Spawn workers here
            orchestrateWorkers(argv.count);

        } else if (argv.option === 'stop') {
            console.log(chalk.yellow('Stopping all workers...'));
            // Stop workers here
            stopWorkers();

        } else {
            console.error(chalk.red('Invalid worker option.'));
        }
    } catch (error) {
        console.error(chalk.bgRed(error.message));
    }
};
