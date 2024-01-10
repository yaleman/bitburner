
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    ns.gang.getMemberNames().forEach((memberName) => {
        ns.gang.setMemberTask(memberName, ns.args[0]);
    });
}