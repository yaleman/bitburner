/// does gang things



const minimumAscensionMult = 1.5;

const rnk1 = 98; 	    // Rank 1 (gives a x2 multiplier)
const rnk2 = 274; 	    // Rank 2 (gives a x4 multiplier, +0.25 rate)
const rnk3 = 550;       // Rank 3 (gives x6 multiplier)
const rnk4 = 934; 	    // Rank 4 (x8 multiplier)
const rnk5 = 56000; 	// Rank 5 (x19 multiplier with mods)
//let rnk6 = 145111; 	// Rank 6 (x36 multiplier with mods)


/** Generates numChars * random ascii number/letters
 * @param {number} numChars
 */
function generateRandomAscii(numChars) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < numChars; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

const rankNumbers = [
    rnk1, rnk2, rnk3, rnk4, rnk5
]

/**
work out what rank we're at for a given skill
@param {number} value
*/
function getMultiRank(value) {
    let i = 0;
    while (i ** 2 < value) {
        i++;
    }

    return i - 1;
}
/**
work out required stats for a given member

@param {string} memberName the name of the gang member
@param {number} memberIndex which index in the list of members is this
*/
function getMinStats(ns, memberName, memberIndex) {
    const memberStats = ns.gang.getMemberInformation(memberName);

    if (memberIndex >= rankNumbers.length) {
        memberIndex = rankNumbers.length - 1;
    }


    let minStats = {
        // hack: { minValue: rankNumbers[getMultiRank(memberStats[`hack_asc_mult`])], taskName: "Train Hacking" },
        hack: { minValue: 1, taskName: "Train Hacking" },
        // cha: { minValue: rankNumbers[getMultiRank(memberStats[`cha_asc_mult`])], taskName: "Train Charisma" },
        cha: { minValue: 1, taskName: "Train Charisma" },
        str: { minValue: rankNumbers[getMultiRank(memberStats[`str_asc_mult`])], taskName: "Train Combat" },
        def: { minValue: rankNumbers[getMultiRank(memberStats[`def_asc_mult`])], taskName: "Train Combat" },
        dex: { minValue: rankNumbers[getMultiRank(memberStats[`dex_asc_mult`])], taskName: "Train Combat" },
        agi: { minValue: rankNumbers[getMultiRank(memberStats[`agi_asc_mult`])], taskName: "Train Combat" },
    };
    return minStats;
}


/**
 *
@param {NS} ns
@param {string} memberName the name of the gang member
@param {number} memberIndex which index in the list of members is this
*/
function needsToLearnThings(ns, memberName, memberIndex) {
    let memberStats = ns.gang.getMemberInformation(memberName);
    let myMinStats = getMinStats(ns, memberName, memberIndex);

    for (const stat of Object.keys(myMinStats)) {
        if (memberStats[stat] < myMinStats[stat].minValue) {
            if (memberStats.task != myMinStats[stat].taskName) {
                ns.gang.setMemberTask(memberName, myMinStats[stat].taskName);
            }
            // ns.tprint(`${memberName} needs to train ${stat} to ${myMinStats[stat].minValue}`);

            return true;
        }
    }

    return false
}

/** @param {NS} ns */
export async function gangTick(ns) {
    let gangInfo = ns.gang.getGangInformation();

    let currentTerritory = gangInfo.territory;

    let memberNames = ns.gang.getMemberNames();
    const maxWantedPenalty = 0.8;

    // ns.tprint(gangInfo);
    //
    // ns.print(`${Math.abs(gangInfo.wantedPenalty)} <= ${maxWantedPenalty} == ${Math.abs(gangInfo.wantedPenalty) <= maxWantedPenalty}`);

    let vigilanteCount = 0;

    for (let memberIndex = 0; memberIndex < memberNames.length; memberIndex++) {
        let memberName = memberNames[memberIndex];

        // ns.tprint(`Lowest combat stat for ${memberName} is ${getLowestCombatSkill(ns, memberName)}`);

        buyGear(ns, memberName);

        let memberStats = ns.gang.getMemberInformation(memberName);

        if (getMinAscensionMult(ns, memberName, ['str', 'def', 'dex', 'agi']) > minimumAscensionMult) {
            if (ns.gang.ascendMember(memberName)) {
                ns.print(`${memberName} ascended`);
                continue;
            } else {
                ns.print(`failed to ascend ${memberName}`);
            }
        }
        if (memberStats.task == "Territory Warfare") {
            if (currentTerritory > 0.85) {
                // we're already on our way to winning, just idle
                ns.gang.setMemberTask(memberName, "Train Combat");
            }
            // ns.tprint("Territory Warfare");
            continue;
        }


        let newTask;

        if (!needsToLearnThings(ns, memberName, memberIndex)) {

            if (Math.abs(gangInfo.wantedPenalty) <= maxWantedPenalty && gangInfo.wantedLevel > 500) {
                if (vigilanteCount < 2) {
                    newTask = "Vigilante Justice";
                    vigilanteCount++;
                }
                // else {
                //     ns.tprint("Too many vigilantes, doing crimes instead");
                // }
            }
            if (newTask == null) {
                newTask = getMyCrime(ns, memberStats);
            }

            // }

            if (memberStats.task != newTask) {
                // ns.print(`${memberName} moving to ${newTask}`);
                ns.gang.setMemberTask(memberName, newTask);
            }

        }

    }

    if (ns.gang.canRecruitMember()) {
        let newName = `member${generateRandomAscii(4)}`;
        if (ns.gang.recruitMember(newName)) {
            ns.tprint(`Recruited ${newName}`);
        } else {
            ns.tprint(`Failed to recruit ${newName}`);
        }
    }
}

/// Get the crime they should be doing.
function getMyCrime(ns, memberStats) {
    if (memberStats.str >= rnk3) {
        return "Human Trafficking";
    } else if (memberStats.str >= rnk2) {
        return "Traffick Illegal Arms";
    } else if (memberStats.str >= rnk1) {
        return "Armed Robbery"
    } else if (memberStats.str > rnk1 / 2) {
        return "Strongarm Civilians";
    }
    return "Mug People";
}

function getMinAscensionMult(ns, memberName, keys) {
    let res = ns.gang.getAscensionResult(memberName)
    let minResult = 0.0;
    if (res == null) {
        return minResult;
    }

    Object.keys(res).forEach((key) => {
        if (keys.includes(key) || keys.length == 0) {
            if (res[key] > minResult) {
                minResult = res[key];
            }
        }
    });
    return minResult;
}



// function calculateTrend(ns, arr, n) {
//     // Check if the array has at least n elements
//     if (arr.length < n) {
//         return "Not enough elements to calculate the trend.";
//     }

//     // Calculate the average value for the first n elements
//     const sumFirstN = arr.slice(0, n).reduce((acc, value) => acc + value, 0);
//     const averageFirstN = sumFirstN / n;

//     // Calculate the average value for the last n elements
//     const sumLastN = arr.slice(-n).reduce((acc, value) => acc + value, 0);
//     const averageLastN = sumLastN / n;

//     // Compare the averages to determine the trend
//     // ns.tprint(`Average First N: ${averageFirstN.toFixed(3)} - Average Last N: ${averageLastN.toFixed(3)}`);
//     // ns.tprint(`first - last: ${averageFirstN - averageLastN}`)
//     if (averageLastN > averageFirstN) {
//         return 1.0;
//     } else if (averageLastN < averageFirstN) {
//         return -1.0;
//     } else {
//         return 0.0;
//     }
// }


function buyGear(ns, memberName) {
    ns.gang.getEquipmentNames().map((equipName) => {
        let equipType = ns.gang.getEquipmentType(equipName);
        if (!["Weapon", "Armor", "Vehicle"].includes(equipType)) {
            return;
        }
        // let equipStats = ns.gang.getEquipmentStats(equipName);
        if (!ns.gang.getMemberInformation(memberName).upgrades.includes(equipName)) {
            let equipCost = ns.gang.getEquipmentCost(equipName);
            if (equipCost < ns.getPlayer().money) {
                ns.print(`buying ${equipName} for ${memberName} $${equipCost.toLocaleString()}`);
                ns.gang.purchaseEquipment(memberName, equipName)
            }

        } else {
            // ns.tprint(`${memberName} already has ${equipName}`);
        }
    });
}

// function getLowestCombatSkill(ns, memberName) {
//     let memberStats = ns.gang.getMemberInformation(memberName);
//     return Math.min(memberStats.str, memberStats.def, memberStats.dex, memberStats.agi);
// }

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    // let wantedTrend = [];
    // let rollingAverageNumber = 10;

    // ns.tprint("Starting gang...");

    // eslint-disable-next-line no-constant-condition
    while (true) {

        if (ns.gang.inGang()) {
            await gangTick(ns);
        }


        // TODO: implement rolling average of checking the wanted level and ensure it's trending down towards the thingie
        // while (wantedTrend.length >= rollingAverageNumber) {
        //     // trim the extras
        //     wantedTrend.shift();
        // }
        // wantedTrend.push(ns.gang.getGangInformation().wantedPenalty);
        // let rollingWantedTrend = wantedTrend.reduce((a, b) => a + b, 0.0) / wantedTrend.length;

        // if (wantedTrend.length >= rollingAverageNumber) {
        //     ns.print(`Wanted Average: ${rollingWantedTrend.toFixed(3)} (over ${wantedTrend.length} ticks) - ${calculateTrend(ns, wantedTrend, wantedTrend.length / 2)}`);
        // }
        if (ns.args.includes("--oneshot")) {
            ns.tprint("Finishing oneshot gang.js");
            break;
        }
        await ns.gang.nextUpdate();
        // await ns.asleep(1000);
    }
}