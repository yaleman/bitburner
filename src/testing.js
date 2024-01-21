
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

    // if (!ns.ns.hasTorRouter()) {
    //     for (let i = 0; i < 100; i++) {
    //         // Usage example:
    //         const foundSpan = findSpanByAriaLabel("Alpha Enterprises");
    //         if (foundSpan) {
    //             ns.print("Found the span with 'aria-label' set to 'Alpha Enterprises':", foundSpan.innerText);
    //             foundSpan.click();

    //             let torButton = findButtonByInnerText("Purchase TOR Router");
    //             if (torButton != null) {
    //                 ns.tprint("Buying TOR router");
    //                 torButton.click();
    //             }

    //         } else {
    //             ns.print("No span with 'aria-label' set to 'Alpha Enterprises' found in the document.");
    //         }

    //         await ns.asleep(1000);
    //     }
    // }


    // ns.tprint(ns.ui.getGameInfo());

}