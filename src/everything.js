import { hackNet } from "./hacknet.js";
import { SERVER_FILENAME, writeServerList, readServerList } from "/utils_serverlist.js";
import { scpAndRun } from "/utils_scpandrun.js";
import { hackPorts } from "/utils_hackports.js";

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




async function spider(ns, serverList) {
    // ns.tprint("spidering", serverList);
    await ns.asleep(1);

    var newlist = serverList.slice();

    try {
        for (var target of serverList) {

            if (dontScan.includes(target)) {
                continue;
            }
            let scanResults;
            try {
                scanResults = ns.scan(target);
            } catch {
                continue;
            }

            for (var scanTarget of scanResults) {
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

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    // runShareOnHome(ns);
    var serverList = ["home"];

    serverList = readServerList(ns, SERVER_FILENAME);


    var lastUpdate = new Date().getTime();
    var lastBalance = 0;
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        // await ns.asleep(1);


        try {
            let myHackingLevel = ns.getPlayer().skills.hacking;
            serverList = await spider(ns, serverList);
            let hackedServers = [];
            // ns.tprint("hacked servers: " + serverList.length);
            for (let server of serverList) {
                if (!ns.serverExists(server)) {
                    continue;
                }
                let rootonserver;
                try {
                    rootonserver = ns.hasRootAccess(server);
                } catch {
                    continue;
                }

                let serverStats = ns.getServer(server);
                if (!rootonserver) {
                    // ns.tprint(`need root on ${server}`);
                    var hackedPortsNum = 0;
                    if (serverStats.numOpenPortsRequired > 0) {
                        hackedPortsNum = await hackPorts(ns, server);
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
            let moneySources = ns.getMoneySources().sinceInstall;
            let hacknetIncome = Math.round(moneySources.hacknet);
            let hacknetExpenses = Math.round(moneySources.hacknet_expenses);
            let hacknetTotal = (hacknetIncome + hacknetExpenses).toLocaleString();
            ns.print(`Hacknet Profit: ${hacknetTotal} (${hacknetIncome.toLocaleString()} ${hacknetExpenses.toLocaleString()})`);
            await ns.asleep(5);
        } catch (err) {
            ns.print(`failed!  ${err}`);
            await ns.asleep(1000);
        }

        await hackNet(ns);

        await ns.asleep(0);
        // ns.tprint("end of loop");

    }
}