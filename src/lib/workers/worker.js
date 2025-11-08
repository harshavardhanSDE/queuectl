import { exec } from "node:child_process";
import { parentPort } from "node:worker_threads";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function execute(command) {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) return { status: false, error: stderr };
        return { status: true, stdout };
    } catch (err) {
        return { status: false, error: err.message };
    }
}

parentPort.on("message", async (data) => {
    if (!data?.command) {
        parentPort.postMessage({ status: false, error: "Command not found" });
        process.exit(1);
        return;
    }

    const result = await execute(data.command);
    parentPort.postMessage(result);
    process.exit(result.status ? 0 : 1); // terminate cleanly
});
