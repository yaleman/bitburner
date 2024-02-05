
// /** @param {NS} ns */
// function everyoneVigilante(ns) {
//     ns.gang.getMemberNames().forEach((memberName) => {
//         // ns.tprint(`${memberName} is vigilante`);
//         ns.gang.setMemberTask(memberName, 'Vigilante Justice');

//     });
// }

// /** @param {NS} ns */
// function everyoneMug(ns) {
//     ns.gang.getMemberNames().forEach((memberName) => {
//         // ns.tprint(`${memberName} is mugging people`);
//         ns.gang.setMemberTask(memberName, 'Mug people');
//     });
// }



const skillPlaces = {
    "Volhaven": {
        "strength": "Sector-12",
        "dexterity": "Sector-23",
        "defense": "Sector-34",
        "agility": "Sector-45",
        "hacking": "Sector-56"
    },
    "Sector-12": {
        "strength": "Powerhouse Gym",
        "dexterity": "Powerhouse Gym",
        "defense": "Powerhouse Gym",
        "agility": "Powerhouse Gym",
        "hacking": "Sector-56"
    }
}


/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    // make sure we have a router

    let stats = ns.getPlayer();

    if (!ns.hasTorRouter()) {
        if (stats.money >= 200000) {
            ns.singularity.purchaseTor();
            ns.tprint("Bought ToR router");
        } else {
            ns.tprint("Not enough money yet...");
        }
    } else {
        ns.tprint("Already have a ToR Router..")
    }

    let minCombatSkills = 80;

    // if (stats.playtimeSinceLastAug < 500000) {
    // we're doing startup things

    if (stats.skills.strength < minCombatSkills) {
        // do strength
        ns.singularity.gymWorkout(skillPlaces[stats.city].strength, "strength", false);
    } else if (stats.skills.dexterity < minCombatSkills) {
        ns.singularity.gymWorkout(skillPlaces[stats.city].dexterity, "dexterity", false);
    } else if (stats.skills.defense < minCombatSkills) {
        ns.singularity.gymWorkout(skillPlaces[stats.city].defense, "defense", false);
    } else if (stats.skills.agility < minCombatSkills) {
        ns.singularity.gymWorkout(skillPlaces[stats.city].agility, "agility", false);
    } else if (stats.skills.hacking < 50) {
        // go to Volhaven and do the thing, else use the local
        // ns.singularity.universityCourse()
    }
    // }

    // get some skills




}