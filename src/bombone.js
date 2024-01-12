import { hackPorts } from "/utils_hackports.js";

import { readServerList, SERVER_FILENAME } from "./utils_serverlist.js";

export function isValidNumber(input) {
    const num = parseFloat(input);
    return !isNaN(num) && typeof num === 'number';
}


/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    if (ns.args.length != 1) {
        ns.tprint("Usage: basichack.js <target>");
        return;
    } else {
        ns.tprint(`hacking ${ns.args[0]}`);
    }
    let scriptRam = ns.getScriptRam("basichack.js");
    // ns.tprint(`Need ${scriptRam}GB of RAM for basichack.js`);
    let serverList = readServerList(ns, SERVER_FILENAME);
    let myStats = ns.getPlayer();
    let myHackingLevel = myStats.skills.hacking;
    // ns.tprint(myStats);
    for (var i = 0; i < serverList.length; i++) {
        let server = serverList[i];

        if (server == "home") {
            continue;
        }

        let stats = ns.getServer(server);
        if (stats.requiredHackingSkill > myHackingLevel) {
            ns.tprint(`can't hack ${server} yet - ${stats.requiredHackingSkill} > ${myHackingLevel}`);
            continue;
        }

        if (!stats.hasAdminRights) {
            let ports = await hackPorts(ns, server);
            if (ports >= stats.numOpenPortsRequired) {
                ns.tprint(`nuking ${server}`);
                ns.nuke(server);
            } else {
                ns.tprint(`can't nuke ${server} yet`);
                continue;
            }

        } else {
            // we have root on the server
        }

        ns.killall(server);
        let serverRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        let threads = serverRam / scriptRam;

        if (threads < 1) {
            // ns.tprint(`Can't run on ${server} - ${serverRam}GB (less than one thread)`);
            continue;
        }
        if (!isValidNumber(threads)) {
            // ns.tprint(`Can't run on ${server} - ${serverRam}GB - got ${threads} threads`);
            continue;
        }




        ns.scp("basichack.js", server, "home");
        // ns.tprint(`doing ${server} - ${serverRam}GB`);
        for (let j = 0; j <= threads; j++) {
            let pid = ns.exec("basichack.js", server, 1, ns.args[0]);
            if (pid == 0) {
                break;
            }

        }

    }
}
