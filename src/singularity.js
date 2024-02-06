
const gymMillenium = "Millenium Fitness Gym";
const gymPowerhouse = "Powerhouse Gym";

const skillPlaces = {
    "Volhaven": {
        "strength": gymMillenium,
        "dexterity": gymMillenium,
        "defense": gymMillenium,
        "agility": gymMillenium,
        "hacking": "ZB Institute of Technology"
    },
    "Sector-12": {
        "strength": gymPowerhouse,
        "dexterity": gymPowerhouse,
        "defense": gymPowerhouse,
        "agility": gymPowerhouse,
        "hacking": "Rothman University"
    }
}


let minCombatSkills = 80;
let minHacking = 100;
const taskFile = "task.txt";

function gymCity(ns, stats) {
    if (stats.city !== "Sector-12" && stats.money >= 200000) {
        ns.singularity.travelToCity("Sector-12");
        ns.print("Traveling to Sector-12");
    }
}


function updateTask(ns, taskName) {
    ns.write(taskFile, taskName, "w");
    if (!ns.getHostname() == "home") {
        ns.scp(taskFile, "home");
    }
}


function getTask(ns) {
    if (ns.fileExists(taskFile, "home")) {
        if (!ns.getHostname() == "home") {
            ns.scp(taskFile, ns.getHostname(), "home");
        }
        return ns.read(taskFile);
    }
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    ns.print(`Combat skills min: ${minCombatSkills}`);

    ns.rm(taskFile, "home");

    //eslint-disable-next-line no-constant-condition
    while (true) {

        let stats = ns.getPlayer();


        // make sure we have a router
        if (!ns.hasTorRouter()) {
            if (stats.money >= 200000) {
                ns.singularity.purchaseTor();
                ns.tprint("Bought ToR router");
            } else {
                // ns.tprint("Not enough money yet...");
            }
        } else {
            // ns.tprint("Already have a ToR Router..")
        }

        if (stats.skills.strength < minCombatSkills) {
            // do strength
            gymCity(ns, stats);
            if (getTask(ns) != "Strength") {
                ns.singularity.gymWorkout(skillPlaces[stats.city].strength, "strength", false);
                ns.print("Doing strength");
                updateTask(ns, "Strength");
            }
        } else if (stats.skills.defense < minCombatSkills) {
            if (getTask(ns) != "Defense") {
                gymCity(ns, stats);
                ns.singularity.gymWorkout(skillPlaces[stats.city].defense, "defense", false);
                ns.print("Doing defense");
                updateTask(ns, "Defense");
            }
        } else if (stats.skills.dexterity < minCombatSkills) {
            if (getTask(ns) != "Dexterity") {
                gymCity(ns, stats);
                ns.singularity.gymWorkout(skillPlaces[stats.city].dexterity, "dexterity", false);
                ns.print("Doing dexterity");
                updateTask(ns, "Dexterity")
            }
        } else if (stats.skills.agility < minCombatSkills) {
            if (getTask(ns) != "Agility") {
                gymCity(ns, stats);
                ns.singularity.gymWorkout(skillPlaces[stats.city].agility, "agility", false);
                ns.print("Doing agility");
                updateTask(ns, "Agility");
            }
        } else if (stats.skills.hacking < minHacking && stats.money >= 0) {
            // go to Volhaven and do the thing, else use the local
            if (stats.city !== "Volhaven" && stats.money >= 200000) {
                ns.singularity.travelToCity("Volhaven");
                ns.print("Traveling to Volhaven");
            } else {
                if (getTask(ns) != "Hacking") {
                    ns.singularity.universityCourse(skillPlaces[stats.city].hacking, "Algorithms", false);
                    ns.print("Doing Hacking");
                    updateTask(ns, "Hacking");
                }

            }
        } else {
            // ns.print("All skills are ok");
            if (ns.heart.break() > -54000) {
                // do the crime thing
                if (ns.singularity.getCrimeChance("Homicide") > 0.75) {
                    doCrime(ns, "Homicide");
                } else {
                    // ns.print(`Homicide chance: ${ns.singularity.getCrimeChance("Homicide")}`);
                    doCrime(ns, "Mug");
                }
            } else {
                if (!ns.gang.inGang) {
                    ns.print("Enough heartbreak, creating gang.");
                    ns.gang.createGang("Slum Snakes");
                    ns.exec("gang.js", "home");
                }

            }
        }

        ns.exec("x_joinfaction.js", "n00dles");

        // if (ns.getServerRequiredHackingLevel("CSEC") <= stats.skills.hacking) {
        //     if (!stats.factions.includes("CyberSec")) {
        //         ns.singularity.joinFaction("CyberSec");
        //     }
        // }

        // ["Netburners", "The Syndicate", "Slum Snakes", "NiteSec", "Speakers for the Dead", "The Black Hand", "BitRunners", "Daedalus"].forEach((faction) => {

        //     autoFaction(ns, faction);
        // });

        await ns.asleep(100);


    }

}

function doCrime(ns, crimeName) {
    if (getTask(ns) !== crimeName) {
        ns.singularity.commitCrime(crimeName, false);
        ns.print(`Doing crime: ${crimeName}`);
        updateTask(ns, crimeName);
    } else {
        // ns.print(`Already doing crime: ${crimeName}`);
    }
}

// function autoFaction(ns, name) {
//     if (!ns.getPlayer().factions.includes(name)) {
//         ns.singularity.joinFaction(name);
//     }
// }