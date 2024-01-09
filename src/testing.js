
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    var hackNodeTotalProfit = 0;

    for (var node = 0; node < ns.hacknet.numNodes(); node++) {
        let stats = ns.hacknet.getNodeStats(node);
        hackNodeTotalProfit += stats.totalProduction;
    }
    ns.tprint(`total profit: ${hackNodeTotalProfit} across ${ns.hacknet.numNodes()} nodes`);
    let hackNodeProfitSec = Math.round(hackNodeTotalProfit / ns.getPlayer().playtimeSinceLastAug, 0);
    ns.tprint(`profit/sec: ${hackNodeProfitSec} across ${ns.hacknet.numNodes()} nodes`);
}