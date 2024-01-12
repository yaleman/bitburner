
/** @param {NS} ns */
export function isRunning(ns, hostname, process_name) {
    return ns.ps(hostname).filter((procs) => procs.filename == process_name).length;
}

export function otherScripts(ns, hostname, filenameToRemove) {
    let processes = ns.ps(hostname);
    let filenames = processes.map((procs) => procs.filename);
    let uniqueFilenames = [...new Set(filenames)];

    if (filenameToRemove) {
        uniqueFilenames = uniqueFilenames.filter((filename) => filename !== filenameToRemove);
    }

    return uniqueFilenames;
}

export async function scpAndRun(ns, serverName, scriptName, maxProcs, args, killothers, dontRunScriptsOn) {
    if (dontRunScriptsOn.includes(serverName)) {
        return;
    }

    var procsRunning = isRunning(ns, serverName, scriptName);

    try {
        if (procsRunning < maxProcs) {
            if (killothers) {
                try {
                    otherScripts(ns, serverName, scriptName).forEach((scriptToKill) => {
                        ns.tprint(`killing ${scriptToKill} on ${serverName}`);
                        ns.killall(serverName, scriptToKill);
                    });
                } catch (err) {
                    ns.tprint(`failed to kill others on ${serverName}: ${err}`);
                }
            }
            ns.scp(scriptName, serverName, "home");
            ns.exec(scriptName, serverName, "1", args);
        }
    } catch (error) {
        ns.print(`Failed to exec ${serverName} on ${serverName}: ${error}`);
    }
    await ns.asleep(1);
    // ns.tprint(`done scpandrun ${serverName} ${scriptName}`)
}