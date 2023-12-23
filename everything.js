import { hackNet } from "hacknet.js";

const dontRunScriptsOn = [
    "CSEC",
    "darkweb",
    "home"
];

async function hackPorts(ns, serverName) {

    let hackedPorts = 0;
    await ns.asleep(0);
    try {
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(serverName);
            hackedPorts++;
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(serverName);
            hackedPorts++;
        }
        if (ns.fileExists("relaySMTP.exe", "home")) {
            ns.relaysmtp(serverName);
            hackedPorts++;
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(serverName);
            hackedPorts++;
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
            ns.sqlinject(serverName);
            hackedPorts++;
        }
    } catch (err) {
        ns.print(`Couldn't hackports ${serverName} due to port hacking err ${err}`);
    }
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

    while (true) {
        try {
            let myHackingLevel = foo.getPlayer().skills.hacking;
            serverList = await spider(foo, serverList);
            let hackedServers = [];
            for (let server of serverList) {

                if (!ns.hasRootAccess(server)) {
                    // ns.print(`hi ${server}`);
                    let serverStats = ns.getServer(server);
                    var hackedPortsNum = 0;
                    if (serverStats.numOpenPortsRequired > 0) {
                        hackedPortsNum = await hackPorts(ns, server);
                    }
                    if (serverStats.numOpenPortsRequired <= hackedPortsNum) {
                        await ns.asleep(0);
                        try {
                            ns.nuke(server);
                        } catch (err) {
                            ns.print(`Could not nuke ${server}: ${err}`);
                        }
                    }
                } else {
                    hackedServers.push(server);
                    if (!dontRunScriptsOn.includes(server)) {
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