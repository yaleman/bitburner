
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    ["CyberSec", "Netburners", "The Syndicate", "Slum Snakes", "NiteSec", "Speakers for the Dead", "The Black Hand", "BitRunners", "Daedalus"].forEach((faction) => {
        autoFaction(ns, faction);
    });

    // await ns.asleep(100);


}

function autoFaction(ns, name) {
    if (!ns.getPlayer().factions.includes(name)) {
        ns.singularity.joinFaction(name);
    }
}