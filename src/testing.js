
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

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    ns.tprint(ns.getMoneySources()
    );

}