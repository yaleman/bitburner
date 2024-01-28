/** @param {NS} ns */
export async function main(ns) {

    const serverName = "I.I.I.I";
    ns.disableLog('ALL');
    await ns.exec("spiderit.js", "home", 1, serverName);

}