import { hackNet } from "hacknet.js";

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
        // if (ns.fileExists("HTTPWorm.exe")) {
        //     ns.httpworm(serverName);
        //     hackedPorts++;
        // }
        // if (ns.fileExists("SQLInject.exe", "home")) {
        //     ns.sqlinject(serverName);
        //     hackedPorts++;
        // }
    } catch (err) {
        ns.print(`Couldn't hack ${serverName} due to port hacking err ${err}`);
    }
    return hackedPorts;
}

function isRunning(ns, hostname, process_name) {
    return ns.ps(hostname).map((procs) => procs.filename == process_name).includes(true)
}

async function scpAndRun(ns, serverName) {
    // var processes = ns.ps(serverName);
    var skippableBasic = 0;
    var skippableShare = 0;
    if (isRunning(ns, serverName, "basichack.js")) {
        skippableBasic += 1;
    }
    if (isRunning(ns, serverName, "share.js")) {
        skippableShare += 1;
    }
    // ns.print(`skippableBasic ${skippableBasic}`);
    // ns.print(`skippableShare ${skippableShare}`);

    try {
        if (skippableBasic == 0) {
            ns.scp("basichack.js", serverName, "home");
            ns.exec("basichack.js", serverName, "1", serverName);
        }
    } catch (error) {
        ns.print(`Failed to exec basichack on ${serverName}: ${error}`);
    }
    try {
        if (skippableShare < 3) {
            ns.scp("share.js", serverName, "home");
            ns.exec("share.js", serverName, "1");
        }
    } catch (error) {
        ns.print(`Failed to exec share on ${serverName}: ${error}`);
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
                if (ns.getServerRequiredHackingLevel(server) > myHackingLevel) {
                    // ns.print(`Can't hack ${server} yet`);

                }
                else if (!ns.hasRootAccess(server)) {
                    // ns.print(`hi ${server}`);
                    let serverStats = ns.getServer(server);
                    var hackedPortsNum = 0;
                    if (serverStats.numOpenPortsRequired > 0) {
                        hackedPortsNum = await hackPorts(ns, server);
                    }
                    ns.print(`This is where we nuke ${server} required: ${serverStats.numOpenPortsRequired} have ${hackedPortsNum}`);
                    if (serverStats.numOpenPortsRequired <= hackedPortsNum) {
                        await ns.asleep(0);
                        try {
                            ns.nuke(server);
                        } catch (err) {
                            ns.print(`Could not nuke ${server}: ${err}`);
                        }
                    }
                }
                else if (server != "home" && server != "darkweb") {
                    hackedServers.push(server);
                    await scpAndRun(ns, server);
                }
            }
            ns.print("\n#############################");
            ns.print(new Date().toISOString());
            ns.print(`hacked servers: ${hackedServers.length}`);
            ns.print(`servers: ${serverList.length}`);
            ns.print(`sharepower ${ns.getSharePower()}\n`);
            await ns.asleep(100);
        } catch (err) {
            ns.print(`failed!  ${err}`);
            await ns.asleep(100);
        }
        await hackNet(ns);
    }

}