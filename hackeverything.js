// TODO: work out how to make a list of things to hack and attack each other from the hacked nodes

async function spider(ns, serverList) {
    var newlist = serverList.slice();

    try {
        let badnames = ['darkweb'];
        for (var target of serverList) {
            for (var scanTarget of await ns.scan(target)) {
                if (!badnames.includes(scanTarget) && !newlist.includes(scanTarget)) {
                    if (!scanTarget.startsWith("myserver")) {
                        newlist.push(scanTarget);

                    }
                }
            }
        }
    } catch {
        ns.print(`spider failed on ${serverList}`);
    }
    return newlist;
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    var serverList = ["home"];

    try {
        while (true) {
            let myHackingLevel = ns.getPlayer().skills.hacking;
            serverList = await spider(ns, serverList);
            let hackedServers = [];
            for (let server of serverList) {
                let serverData = ns.getServer(server);
                if (!serverData.backdoorInstalled && server == "CSEC") {
                    ns.print("Need to backdoor CSEC");
                }


                if (!ns.hasRootAccess(server)) {
                    if (ns.getServerRequiredHackingLevel(server) <= myHackingLevel) {
                        ns.print(`hacking ${server}`);
                        try {
                            if (ns.fileExists("BruteSSH.exe", "home")) {
                                ns.brutessh(server);
                            }
                            if (ns.fileExists("FTPCrack.exe", "home")) {
                                ns.ftpcrack(server);
                            }
                            if (ns.fileExists("relaySMTP.exe", "home")) {
                                ns.relaysmtp(server);
                            }
                            if (ns.fileExists("HTTPWorm.exe", "home")) {
                                ns.httpworm(server);
                            }
                            if (ns.fileExists("SQLInject.exe", "home")) {
                                ns.sqlinject(server);
                            }

                        } catch {
                            ns.print(`Could not hack port on ${server}`);
                        }
                        try {

                            ns.nuke(server);
                        } catch {
                            ns.print(`Could not nuke ${server}`);
                        }
                    }
                } else if (server != "home" && server != "darkweb") {

                    if (server == "CSEC") {
                    }

                    hackedServers.push(server);
                    var processes = ns.ps(server);
                    var skippableBasic = 0;
                    var skippableShare = 0;
                    if (processes) {
                        for (let process of processes) {
                            if (process.filename == "basichack.js") {
                                skippableBasic = 1;
                            }
                            if (process.filename == "share.js") {
                                skippableShare += 1;
                            }
                        };
                        if (skippableBasic == 0) {
                            // copy the hackin' script and run it
                            ns.print(`running basichack.js on ${server}`);
                            ns.scp("basichack.js", server);
                            ns.exec("basichack.js", server, 1, server);
                        }
                        if (skippableShare < 5) {
                            ns.scp("share.js", server);
                            ns.exec("share.js", server, 1);
                        }
                    }
                }
            }
            ns.print(`hacked servers: ${hackedServers.length}`);
            ns.print(`servers: ${serverList.length}`);
            ns.print(`sharepower ${ns.getSharePower()}`);
            await ns.sleep(1000);
        }
    } catch {
        ns.print(`failed on ${serverList}`);
    }


}