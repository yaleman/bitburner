import { hackNet } from "hacknet.js";

const dontRunScriptsOn = [
    "CSEC",
    "darkweb",
    "home"
];

async function hackPorts(ns, serverName) {

    ns.tprint(`hackports ${serverName}`);
    let hackPortStats = ns.getServer(serverName);
    ns.tprint(`got stats hackports ${serverName}`);
    let hackedPorts = 0;
    // await ns.asleep(1);

    if (ns.fileExists("BruteSSH.exe", "home") && !hackPortStats.sshPortOpen) {
        try {
            ns.tprint(`brutessh ${serverName}`);
            ns.brutessh(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't brutessh ${serverName} due to port hacking err ${err}`);
        }
    }
    if (ns.fileExists("FTPCrack.exe", "home") && !hackPortStats.ftpPortOpen) {
        try {
            ns.tprint(`ftpcrack ${serverName}`);
            ns.ftpcrack(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't ftpcrack ${serverName} due to port hacking err ${err}`);
        }
    }
    if (ns.fileExists("relaySMTP.exe", "home") && !hackPortStats.smtpPortOpen) {
        try {
            ns.tprint(`relaysmtp ${serverName}`);
            // ns.relaysmtp(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't relaysmtp ${serverName} due to port hacking err ${err}`);
        }
    }
    if (ns.fileExists("HTTPWorm.exe", "home") && !hackPortStats.httpPortOpen) {
        try {
            ns.tprint(`HTTPWorm ${serverName}`);
            ns.httpworm(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't httpworm ${serverName} due to port hacking err ${err}`);
        }
    }
    if (ns.fileExists("SQLInject.exe", "home") && !hackPortStats.sqlPortOpen) {
        try {
            ns.tprint(`sqlinject ${serverName}`);
            ns.sqlinject(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't sqlinject ${serverName} due to port hacking err ${err}`);
        }
    }

    await ns.asleep(0);
    ns.tprint(`returning from hackports ${serverName} ${hackPortStats}`);
    return hackedPorts;
}

function isRunning(ns, hostname, process_name) {

    let res = ns.ps(hostname).map((procs) => procs.filename == process_name).includes(true);
    // ns.print(`isRunning(${hostname}, ${process_name}) = ${res}`);
    return res;
}

async function scpAndRun(ns, serverName, scriptName, maxProcs, args) {
    if (dontRunScriptsOn.includes(serverName)) {
        return;
    }
    var procsRunning = 0;
    if (isRunning(ns, serverName, scriptName)) {
        procsRunning += 1;
    }

    try {
        if (procsRunning < maxProcs) {
            ns.scp(scriptName, serverName, "home");
            ns.exec(scriptName, serverName, "1", args);
        }
    } catch (error) {
        ns.print(`Failed to exec ${serverName} on ${serverName}: ${error}`);
    }
    await ns.asleep(1);
}

async function spider(ns, serverList) {
    var newlist = serverList.slice();
    const badnames = ['darkweb', '0', 0, ".", "home"];

    try {
        for (var target of serverList) {
            for (var scanTarget of ns.scan(target)) {
                if (!badnames.includes(scanTarget) && !newlist.includes(scanTarget)) {
                    if (ns.getServer(scanTarget).purchasedByPlayer == false) {
                        newlist.push(scanTarget);

                    }
                }
            }
        }
        await ns.asleep(1);
    } catch (err) {
        ns.print(`spider failed on ${serverList}`);
        ns.print(err);
        await ns.asleep(1);
    }
    return [...newlist].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function runShareOnHome(ns) {
    if (!isRunning(ns, "home", "share.js")) {
        ns.exec("share.js", "home", 4);
    }
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    runShareOnHome(ns);
    var serverList = ["home"];
    let foo = ns;

    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        try {
            let myHackingLevel = foo.getPlayer().skills.hacking;
            serverList = await spider(foo, serverList);
            let hackedServers = [];
            for (let server of serverList) {
                if (!ns.hasRootAccess(server)) {
                    ns.tprint(`need root on ${server}`);
                    let serverStats = ns.getServer(server);
                    var hackedPortsNum = 0;
                    if (serverStats.numOpenPortsRequired > 0) {
                        ns.tprint(`about to hackports ${server}`);
                        hackedPortsNum = await hackPorts(ns, server);
                        ns.tprint(`came back from hackports ${server}`);
                    }
                    if (serverStats.numOpenPortsRequired <= hackedPortsNum) {
                        try {
                            ns.tprint(`nuking ${server}`);
                            ns.nuke(server);
                        } catch (err) {
                            ns.tprint(`Could not nuke ${server}: ${err}`);
                        }
                        await ns.asleep(0);
                    } else {
                        await ns.asleep(0);
                        // ns.print(`Not nuking ${server} because ${hackedPortsNum} < ${serverStats.numOpenPortsRequired}`);
                    }
                }
                else {
                    hackedServers.push(server);
                    if (!dontRunScriptsOn.includes(server)) {
                        ns.tprint(`should be running scripts on ${server}`);
                        if (ns.getServerRequiredHackingLevel(server) <= myHackingLevel) {
                            await scpAndRun(ns, server, "basichack.js", 1, server);
                        }
                        await scpAndRun(ns, server, "share.js", 3, "");
                    }
                }
            }
            ns.print("\n#############################");
            ns.print(new Date().toISOString());
            ns.print(`hacked servers: ${hackedServers.length}`);
            ns.print(`servers: ${serverList.length}`);
            ns.print(`sharepower ${ns.getSharePower()}\n`);
            await ns.asleep(10);
        } catch (err) {
            ns.print(`failed!  ${err}`);
            await ns.asleep(10);
        }
        await hackNet(ns);
        await ns.asleep(0);
    }
}