const badnames = ['darkweb', '0', 0, ".", "home"];

export async function xspider(ns, myTarget, parents, seen, lookingfor) {
    // await ns.asleep(1);
    seen.push(myTarget);

    for (const spiderTarget of ns.scan(myTarget)) {
        if (badnames.includes(spiderTarget)) {
            continue;
        }
        if (!seen.includes(spiderTarget)) {
            var printIt = false;
            if (ns.args.length == 0) {
                printIt = true;
            } else if (lookingfor == spiderTarget || spiderTarget.includes(lookingfor)) {
                printIt = true;
            }
            if (printIt) {
                let stats = ns.getServer(spiderTarget);
                let myStats = ns.getPlayer();
                // let finalCommand = "hackit";
                if (stats.requiredHackingSkill > myStats.skills.hacking) {
                    ns.tprint(`### can't hack ${spiderTarget} yet - ${stats.requiredHackingSkill} > ${myStats.skills.hacking} ###`);
                    // finalCommand = "analyze";
                }
                let result = [];
                parents.forEach((parent) => {
                    result.push(parent);
                })
                result.push(spiderTarget);
                // outputString += `connect ${spiderTarget}; ${finalCommand}`;
                // ns.tprint(outputString);
                return result;
            }

            let newParents = parents.slice();
            newParents.push(spiderTarget);
            await xspider(ns, spiderTarget, newParents, seen.slice(), lookingfor)
            await ns.asleep(0);
        }
    }
}

/** @param {NS} ns */
export async function main(ns) {

    ns.disableLog('ALL');
    var seen = [];
    let foo = await xspider(ns, "home", [], seen, "CSEC");
    ns.tprint(foo);


}