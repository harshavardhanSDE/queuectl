import { exec } from 'node:child_process';
import { parentPort, workerData } from 'node:worker_threads';
import { promisify } from 'node:util';


// converts the function to promise.
const executeAsyncCommands = promisify(exec);

async function execute( command ){
    try {
        const { stdout, stderr } = await executeAsyncCommands(command);
        if ( stderr ) {
            return {
                status: false,
                error: stderr,
            } // status, err
        } // stderr

        return {
            status: true,
            stdout: stdout,
        } // stdout

    } catch ( err ) {
        return {
            status: false,
            error: err,
        }; // returning error status,
    }
}


const run = async () => {
    const command = workerData?.command;
    if (!command) {
        parentPort.postMessage({
            status: false,
            error: new Error("Command not found"),
        })
    }
    const onExecuted = await execute(command);
    parentPort.postMessage(onExecuted);
}

run();



