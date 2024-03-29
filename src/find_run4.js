/** @param {NS} ns */
export async function main(ns) {

    const serverName = "run4theh111z";

    ns.disableLog('ALL');

    let stats = ns.getServer(serverName);
    let myStats = ns.getPlayer();
    if (stats.requiredHackingSkill > myStats.skills.hacking) {
        ns.tprint(`### can't hack ${serverName} yet - ${stats.requiredHackingSkill} > ${myStats.skills.hacking} ###`);

    }

    await ns.exec("spiderit.js", "home", 1, serverName);

}