
/** @param {NS} ns */
function everyoneVigilante(ns) {
    ns.gang.getMemberNames().forEach((memberName) => {
        // ns.tprint(`${memberName} is vigilante`);
        ns.gang.setMemberTask(memberName, 'Vigilante Justice');

    });
}

/** @param {NS} ns */
function everyoneMug(ns) {
    ns.gang.getMemberNames().forEach((memberName) => {
        // ns.tprint(`${memberName} is mugging people`);
        ns.gang.setMemberTask(memberName, 'Mug people');
    });
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    // var hackNodeTotalProfit = 0;

    // for (var node = 0; node < ns.hacknet.numNodes(); node++) {
    //     let stats = ns.hacknet.getNodeStats(node);
    //     hackNodeTotalProfit += stats.totalProduction;
    // }
    // ns.tprint(`total profit: ${hackNodeTotalProfit} across ${ns.hacknet.numNodes()} nodes`);
    // let hackNodeProfitSec = Math.round(hackNodeTotalProfit / ns.getPlayer().playtimeSinceLastAug, 0);
    // ns.tprint(`profit/sec: ${hackNodeProfitSec} across ${ns.hacknet.numNodes()} nodes`);
    let allState = "mugging";

    while (true) {
        let gangInfo = ns.gang.getGangInformation();

        if (gangInfo.wantedPenalty > 1.0) {
            everyoneVigilante(ns);
            allState = "vigilante";
        } else if (allState != "mugging") {
            ns.tprint(`We are not wanted, so we are mugging. penalty: ${gangInfo.wantedPenalty}`);
            everyoneMug(ns);
            allState = "mugging";
        }
        await ns.asleep(1000);
    }


}