import { hackNet } from "hacknet.js";

const SERVER_FILENAME = "knownservers.txt";

const dontScan = [
    "CSEC",
    "darkweb",
    "avmnite-02h",
    "I.I.I.I",
    "run4theh111z",
];

const dontRunScriptsOn = [
    "CSEC",
    "darkweb",
    "home",
    "avmnite-02h",
    "I.I.I.I",
    "run4theh111z",

];

const badnames = [
    ...dontRunScriptsOn.slice(),
    'darkweb',
    '0',
    0,
    ".",
    "home",
];

function writeServerList(ns, serverList, filename) {
    ns.write(filename, JSON.stringify(serverList), "w");
}

function readServerList(ns, filename) {
    ns.tprint(`reading server list from ${filename}`);
    let filecontents = ns.read(filename);
    if (filecontents.length == 0) {
        ns.tprint("got empty file");
        ns.tprint(`file: ${filecontents}`)
        return ["home"];
    }

    try {
        let res = JSON.parse(filecontents);
        ns.tprint(`read ${res.length} servers from ${filename}`);
        return res;
    } catch (err) {
        ns.tprint(`failed to read ${filename}: ${err}`);
        return ["home"];
    }
}

async function hackPorts(ns, serverName, requiredPorts) {
    // ns.tprint(`hackports ${serverName}`);
    await ns.asleep(1);
    let hackPortStats = ns.getServer(serverName);
    let hackedPorts = 0;


    if (hackPortStats.sshPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("BruteSSH.exe", "home")) {
        try {
            ns.tprint(`brutessh ${serverName}`);
            ns.brutessh(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't brutessh ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.ftpPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("FTPCrack.exe", "home")) {
        try {
            ns.tprint(`ftpcrack ${serverName}`);
            ns.ftpcrack(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't ftpcrack ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.smtpPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("relaySMTP.exe", "home")) {
        try {
            ns.tprint(`relaysmtp ${serverName}`);
            ns.relaysmtp(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't relaysmtp ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts > requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.httpPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("HTTPWorm.exe", "home")) {
        try {
            ns.tprint(`HTTPWorm ${serverName}`);
            ns.httpworm(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't httpworm ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts > requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.sqlPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("SQLInject.exe", "home")) {
        try {
            ns.tprint(`sqlinject ${serverName}`);
            ns.sqlinject(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't sqlinject ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }


    await ns.asleep(1);
    return hackedPorts;
}

function isRunning(ns, hostname, process_name) {
    // let res = ns.ps(hostname).map((procs) => procs.filename == process_name).includes(true);
    // return res;
    return ns.ps(hostname).filter((procs) => procs.filename == process_name).length;
}

function otherScripts(ns, hostname, filenameToRemove) {
    let processes = ns.ps(hostname);
    let filenames = processes.map((procs) => procs.filename);
    let uniqueFilenames = [...new Set(filenames)];

    if (filenameToRemove) {
        uniqueFilenames = uniqueFilenames.filter((filename) => filename !== filenameToRemove);
    }

    return uniqueFilenames;
}

async function scpAndRun(ns, serverName, scriptName, maxProcs, args, killothers) {
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

async function spider(ns, serverList) {
    // ns.tprint("spidering", serverList);
    await ns.asleep(1);

    var newlist = serverList.slice();

    try {
        for (var target of serverList) {
            if (dontScan.includes(target)) {
                continue;
            }
            for (var scanTarget of ns.scan(target)) {
                if (!badnames.includes(scanTarget) && !newlist.includes(scanTarget)) {
                    if (ns.getServer(scanTarget).purchasedByPlayer == false) {
                        ns.tprint(`adding ${scanTarget}`);
                        newlist.push(scanTarget);
                    } else {
                        scpAndRun(ns, scanTarget, "share.js", 1000, scanTarget, false);
                    }
                }
            }
        }
    } catch (err) {
        ns.tprint("spider failed");
        ns.tprint(err);
    }
    // await ns.asleep(10);
    // ns.tprint("returning from spider");
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

    serverList = readServerList(ns, SERVER_FILENAME);


    var lastUpdate = new Date().getTime();
    var lastBalance = 0;
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        await ns.asleep(1);


        try {
            let myHackingLevel = ns.getPlayer().skills.hacking;
            serverList = await spider(ns, serverList);
            let hackedServers = [];
            // ns.tprint("hacked servers: " + serverList.length);
            for (let server of serverList) {
                // ns.tprint(`checking ${server}`)
                if (!ns.hasRootAccess(server)) {
                    // ns.tprint(`need root on ${server}`);
                    var serverStats = ns.getServer(server);
                    var hackedPortsNum = 0;
                    if (serverStats.numOpenPortsRequired > 0) {
                        hackedPortsNum = await hackPorts(ns, server, serverStats.numOpenPortsRequired);
                    }
                    // ns.tprint(`${server} ports required ${serverStats.numOpenPortsRequired} have ${hackedPortsNum}`)
                    if (serverStats.numOpenPortsRequired <= hackedPortsNum) {
                        try {
                            ns.tprint(`nuking ${server}`);
                            await ns.asleep(5);
                            ns.nuke(server);
                            ns.tprint(`successfully nuked ${server}`);
                        } catch (err) {
                            await ns.asleep(5);
                            ns.tprint(`Could not nuke ${server}: ${err}`);
                        }
                    } else {
                        await ns.asleep(1);
                    }
                }
                else {
                    hackedServers.push(server);
                    if (!dontRunScriptsOn.includes(server)) {
                        if (ns.getServerRequiredHackingLevel(server) <= myHackingLevel) {

                            await scpAndRun(ns, server, "basichack.js", 1, server, true);
                        }
                        await scpAndRun(ns, server, "share.js", 1000, server, false);
                    }
                }
            }
            writeServerList(ns, serverList, SERVER_FILENAME);

            let timeDiff = (new Date().getTime() - lastUpdate) / 1000.0;
            lastUpdate = new Date().getTime();

            let moneyDelta = ns.getPlayer().money - lastBalance;
            let moneyDeltaRate = moneyDelta / timeDiff;
            lastBalance = ns.getPlayer().money;
            ns.print("\n#############################");
            // ns.print(`timeDiff: ${timeDiff} moneyDeltaRate: ${moneyDeltaRate}`);
            ns.print(`moneyDeltaRate: ${Math.round(moneyDeltaRate, 2)}`);
            if (ns.args.length > 0) {
                var targetTime = Math.round(ns.args[0] / moneyDeltaRate, 2);
                if (targetTime > 3600) {
                    targetTime = `${Math.round(targetTime / 3600.0, 4)} hours`;
                } else {
                    targetTime = `${targetTime} seconds`;
                }
                if (ns.args[0] > ns.getPlayer().money) {
                    ns.print(`Time to target: ${targetTime} ${Math.round(ns.args[0] - ns.getPlayer().money, 0)}`);
                }
            }

            ns.print(`servers: ${hackedServers.length}/${serverList.length}`);
            ns.print(`sharepower +${Math.round((ns.getSharePower() - 1) * 100, 2)}%`);
            ns.print(`karma: ${Math.round(ns.heart.break(), 1)}`)
            await ns.asleep(5);
        } catch (err) {
            ns.print(`failed!  ${err}`);
            await ns.asleep(1000);
        }
        try {
            // ns.tprint("Doing hacknet");
            await hackNet(ns);
            // ns.tprint("completed hacknet");

        } catch (err) {
            ns.tprint(`Failed to hacknet: ${err}`)
        }
        await ns.asleep(5);
        // ns.tprint("end of loop");

    }
}