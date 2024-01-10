/// does gang things

const minimumAscensionMult = 2.0;

const rnk1 = 98; 	   	// Rank 1 (gives a x2 multiplier)
const rnk2 = 274; 	// Rank 2 (gives a x4 multiplier, +0.25 rate)
const rnk3 = 550;   	// Rank 3 (gives x6 multiplier)
const rnk4 = 934; 	// Rank 4 (x8 multiplier)
const rnk5 = 56000; 	// Rank 5 (x19 multiplier with mods)
//let rnk6 = 145111; 	// Rank 6 (x36 multiplier with mods)


const rankNumbers = [
    rnk1, rnk2, rnk3, rnk4, rnk5
]

function getMinStats(memberIndex) {
    if (memberIndex >= rankNumbers.length) {
        memberIndex = rankNumbers.length - 1;
    }

    let minStats = {
        hack: { minValue: 1, taskName: "Train Hacking" },
        cha: { minValue: 1, taskName: "Train Charisma" },
        str: { minValue: rankNumbers[memberIndex], taskName: "Train Combat" },
        def: { minValue: rankNumbers[memberIndex], taskName: "Train Combat" },
        dex: { minValue: rankNumbers[memberIndex], taskName: "Train Combat" },
        agi: { minValue: rankNumbers[memberIndex], taskName: "Train Combat" },
    };
    return minStats;
}


/** @param {NS} ns */
function checkUpgrade(ns, memberName, memberIndex) {
    let memberStats = ns.gang.getMemberInformation(memberName);
    let myMinStats = getMinStats(memberIndex);

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
    let memberNames = ns.gang.getMemberNames();
    // ns.tprint(gangInfo);
    const maxWantedPenalty = 0.8;
    // let wantedGainRate = gangInfo.wantedLevelGainRate;
    // let vigilantes = 0;

    for (let memberIndex = 0; memberIndex < memberNames.length; memberIndex++) {
        let memberName = memberNames[memberIndex];
        // ns.tprint(`Checking ${memberName}`);

        if (getMinAscensionMult(ns, memberName, ['str', 'def', 'dex', 'agi']) > minimumAscensionMult) {
            if (ns.gang.ascendMember(memberName)) {
                ns.tprint(`${memberName} ascended`);
                continue;
            } else {
                ns.tprint(`failed to ascend ${memberName}`);
            }
        }

        // memberNames.forEach((memberName) => {
        let memberStats = ns.gang.getMemberInformation(memberName);
        let newTask;

        if (!checkUpgrade(ns, memberName, memberIndex)) {
            if (gangInfo.wantedPenalty <= maxWantedPenalty) {
                newTask = "Vigilante Justice";
                // vigilantes += 1;
            }
            else {
                newTask = getMyCrime(ns, memberStats);
            }

            if (memberStats.task != newTask) {
                ns.tprint(`${memberName} moving to ${newTask}`);
                ns.gang.setMemberTask(memberName, newTask);
            }
        } else {
            // ns.tprint(`${memberName} is upgrading`);
        }
    }

    // ns.tprint(`vigilantes: ${vigilantes} - wantedPenalty: ${gangInfo.wantedPenalty.toFixed(3)} - wantedGainRate: ${wantedGainRate.toFixed(3)}`);

    if (ns.gang.canRecruitMember()) {
        let newName = `member${String(memberNames.length).padStart(3, '0')}`;
        if (ns.gang.recruitMember(newName)) {
            ns.tprint(`Recruited ${newName}`);
        } else {
            ns.tprint(`Failed to recruit ${newName}`);
        }
    }
}

function getMyCrime(ns, memberStats) {
    // ns.tprint(ns.gang.getTaskStats("Traffick Illegal Arms"));
    if (memberStats.str >= rnk2) {
        return "Traffick Illegal Arms";
    } else if (memberStats.str >= rnk1) {
        return "Armed Robbery"
    } else if (memberStats.str > 50) {
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


/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    // let wantedTrend = [];
    // let rollingAverageNumber = 10;

    // ns.tprint("Starting gang...");

    // eslint-disable-next-line no-constant-condition
    while (true) {
        await gangTick(ns);

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
    }
}