import path from 'node:path';
import fs from 'node:fs';


async function getConfig() {
    try {
            let configFile = fs.readFileSync(path.resolve("queuectl.config.json"), 'utf8');
            return JSON.parse(configFile);
    } catch (err) {
        throw new Error(err);
    }
}