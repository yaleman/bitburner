/// does gang things

const minStats = {
    hack: { minValue: 5, taskName: "Train Hacking" },
    cha: { minValue: 5, taskName: "Train Charisma" },
    str: { minValue: 50, taskName: "Train Combat" },
    def: { minValue: 50, taskName: "Train Combat" },
    dex: { minValue: 50, taskName: "Train Combat" },
    agi: { minValue: 50, taskName: "Train Combat" },
};

// /** @param {NS} ns */
// function everyoneTask(ns, task) {
//     ns.gang.getMemberNames().forEach((memberName) => {
//         ns.gang.setMemberTask(memberName, task);
//     });
// }

// /** @param {NS} ns */
// function everyoneVigilante(ns) {
//     everyoneTask(ns, 'Vigilante Justice');
// }

// /** @param {NS} ns */
// function everyoneMug(ns) {
//     everyoneTask(ns, 'Mug People');
// }

/** @param {NS} ns */
function checkUpgrade(ns, memberName) {
    let memberStats = ns.gang.getMemberInformation(memberName);

    for (const stat of Object.keys(minStats)) {
        if (memberStats[stat] < minStats[stat].minValue) {
            if (memberStats.task != minStats[stat].taskName) {
                ns.gang.setMemberTask(memberName, minStats[stat].taskName);
            }
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

    memberNames.forEach((memberName) => {
        let memberStats = ns.gang.getMemberInformation(memberName);
        let newTask;

        if (!checkUpgrade(ns, memberName)) {
            if (gangInfo.wantedPenalty <= maxWantedPenalty) {
                newTask = "Vigilante Justice";
                // vigilantes += 1;
            } else if (memberStats.str > 50) {
                newTask = "Strongarm Civilians";
            } else {
                newTask = "Mug People";
            }
            if (memberStats.task != newTask) {
                ns.tprint(`${memberName} moving to ${newTask}`);
                ns.gang.setMemberTask(memberName, newTask);
            }
        }
    });

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

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    let wantedTrend = [];
    let rollingAverageNumber = 10;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        await gangTick(ns);

        // TODO: implement rolling average of checking the wanted level and ensure it's trending down towards the thingie
        while (wantedTrend.length >= rollingAverageNumber) {
            // trim the extras
            wantedTrend.shift();
        }
        wantedTrend.push(ns.gang.getGangInformation().wantedPenalty);
        let rollingWantedTrend = wantedTrend.reduce((a, b) => a + b, 0.0) / wantedTrend.length;

        if (wantedTrend.length >= rollingAverageNumber) {
            ns.print(`Wanted Average: ${rollingWantedTrend.toFixed(3)} (over ${wantedTrend.length} ticks) - ${calculateTrend(ns, wantedTrend, wantedTrend.length / 2)}`);
        }
        await ns.gang.nextUpdate();
        if (ns.args.includes("--oneshot")) {
            // ns.tprint("Finishing oneshot gang.js");
            break;
        }
    }
}


function calculateTrend(ns, arr, n) {
    // Check if the array has at least n elements
    if (arr.length < n) {
        return "Not enough elements to calculate the trend.";
    }

    // Calculate the average value for the first n elements
    const sumFirstN = arr.slice(0, n).reduce((acc, value) => acc + value, 0);
    const averageFirstN = sumFirstN / n;

    // Calculate the average value for the last n elements
    const sumLastN = arr.slice(-n).reduce((acc, value) => acc + value, 0);
    const averageLastN = sumLastN / n;

    // Compare the averages to determine the trend
    ns.tprint(`Average First N: ${averageFirstN.toFixed(3)} - Average Last N: ${averageLastN.toFixed(3)}`);
    ns.tprint(`first - last: ${averageFirstN - averageLastN}`)
    if (averageLastN > averageFirstN) {
        return 1.0;
    } else if (averageLastN < averageFirstN) {
        return -1.0;
    } else {
        return 0.0;
    }
}