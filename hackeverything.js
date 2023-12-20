// TODO: work out how to make a list of things to hack and attack each other from the hacked nodes

async function spider(ns, serverList) {
    var newlist = serverList.slice();
    let badnames = ['darkweb'];

    for (var target of serverList) {
        for (var scanTarget of await ns.scan(target)) {
            if (!badnames.includes(scanTarget) && !newlist.includes(scanTarget)) {
                newlist.push(scanTarget);
            }
        }
    }
    return newlist;
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');
    var serverList = ["home"];

    while (true) {
        ns.clearLog();
        let myHackingLevel = ns.getPlayer().skills.hacking;
        serverList = await spider(ns, serverList);
        let hackedServers = [];
        for (var i = 0; i < serverList.length; i++) {
            let server = serverList[i];
            if (!ns.hasRootAccess(server)) {
                if (ns.getServerRequiredHackingLevel(server) <= myHackingLevel) {
                    ns.print(`hacking ${server}`);
                    try {
                        ns.brutessh(server);
                        ns.ftpcrack(server);
                        ns.relaysmtp(server);
                        ns.httpworm(server);
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
                hackedServers.push(server);
                var processes = ns.ps(server);
                var skippable = 0;
                if (processes) {

                    for (let process of processes) {
                        if (process.filename == "basichack.js") {
                            skippable = 1;
                            // ns.print(`${server} is running basichack already`);
                        }
                    };
                    if (skippable == 0) {
                        // copy the hackin' script and run it
                        ns.print(`running basichack.js on ${server}`);
                        ns.scp("basichack.js", server);
                        ns.exec("basichack.js", server, 1, server);
                    }
                }
            }
        }
        ns.print(`hacked servers: ${hackedServers.length}`);
        ns.print(`servers: ${serverList.length}`);
        await ns.sleep(1000);
    }


}