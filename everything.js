const badnames = ['darkweb', '0', 0, ".", "home"];

function scpAndRun(ns, serverName) {
    var processes = ns.ps(serverName);
    var skippableBasic = 0;
    var skippableShare = 0;
    for (let process of processes) {
        if (process.filename == "basichack.js") {
            skippableBasic = 1;
        }
        if (process.filename == "share.js") {
            skippableShare += 1;
        }
    };
    if (skippableBasic == 0) {
        ns.scp("basichack.js", serverName);
        ns.exec("basichack.js", serverName, 1, serverName);
    }
    if (skippableShare < 3) {
        ns.scp("share.js", serverName);
        ns.exec("share.js", serverName, 1);
    }
}

async function spider(ns, serverList) {
    var newlist = serverList.slice();
    try {
        for (var target of serverList) {
            for (var scanTarget of ns.scan(target)) {
                if (!badnames.includes(scanTarget) && !newlist.includes(scanTarget)) {
                    newlist.push(scanTarget);
                }
            }
        }
        await ns.sleep(1);
    } catch {
        ns.print(`spider failed on ${serverList}`);
        await ns.asleep(1);
    }
    return [...new Set(newlist)];
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    var serverList = ["home"];

    while (true) {
        try {
            let myHackingLevel = ns.getPlayer().skills.hacking;
            serverList = await spider(ns, serverList);
            let hackedServers = [];
            for (let server of serverList) {
                if (ns.getServerRequiredHackingLevel(server) > myHackingLevel) {
                    continue;
                }
                if (!ns.hasRootAccess(server)) {
                    ns.print(`hi ${server}`);
                    if (ns.fileExists("BruteSSH.exe")) {
                        ns.brutessh(server);
                    }
                    if (ns.fileExists("FTPCrack.exe")) {
                        ns.ftpcrack(server);
                    }
                    if (ns.fileExists("relaySMTP.exe")) {
                        ns.relaysmtp(server);
                    }
                    if (ns.fileExists("HTTPWorm.exe")) {
                        ns.httpworm(server);
                    }
                    if (ns.fileExists("SQLInject.exe", "home")) {
                        ns.sqlinject(server);
                    }
                    try {
                        await ns.asleep(0);
                        // ns.nuke(server);
                    } catch (err) {
                        ns.print(`Could not nuke ${server}: ${err}`);
                    }
                }
                else if (server != "home" && server != "darkweb") {
                    hackedServers.push(server);
                    scpAndRun(ns, server);

                }
            }
            ns.print(new Date().toISOString());
            ns.print(`hacked servers: ${hackedServers.length}`);
            ns.print(`servers: ${serverList.length}`);
            ns.print(`sharepower ${ns.getSharePower()}\n\n`);
            await ns.sleep(100);
        } catch (err) {
            ns.print(`failed!  ${err}`);
            await ns.sleep(100);
        }
    }

}