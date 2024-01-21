const badnames = ['darkweb', '0', 0, ".", "home"];

export async function spider(ns, myTarget, parents, seen) {
    await ns.asleep(1);
    seen.push(myTarget);

    for (const spiderTarget of ns.scan(myTarget)) {
        if (badnames.includes(spiderTarget)) {
            continue;
        }
        if (!seen.includes(spiderTarget)) {
            var printIt = false;
            if (ns.args.length == 0) {
                printIt = true;
            } else if (ns.args[0] == spiderTarget || spiderTarget.includes(ns.args[0])) {
                printIt = true;
            }

            if (printIt) {
                var outputString = "";
                parents.forEach((parent) => {
                    outputString += `connect ${parent} ; `;
                })
                outputString += `connect ${spiderTarget}; hackit`;
                ns.tprint(outputString);
            }

            let newParents = parents.slice();
            newParents.push(spiderTarget);
            await spider(ns, spiderTarget, newParents, seen.slice())
            await ns.asleep(0);
        }
    }
}

/** @param {NS} ns */
export async function main(ns) {

    ns.disableLog('ALL');
    var seen = [];
    await spider(ns, "home", [], seen)


}