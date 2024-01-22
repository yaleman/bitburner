/** @param {NS} ns */
export async function main(ns) {


    const serverName = "I.I.I.I";

    ns.disableLog('ALL');

    let stats = ns.getServer(serverName);
    let myStats = ns.getPlayer();
    if (stats.requiredHackingSkill > myStats.skills.hacking) {
        ns.tprint(`### can't hack ${serverName} yet - ${stats.requiredHackingSkill} > ${myStats.skills.hacking} ###`);

    }
    ns.disableLog('ALL');
    await ns.exec("spiderit.js", "home", 1, serverName);

}