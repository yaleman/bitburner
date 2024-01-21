/** @param {NS} ns */
export async function main(ns) {

    ns.disableLog('ALL');
    await ns.exec("spiderit.js", "home", 1, "I.I.I.I");

}