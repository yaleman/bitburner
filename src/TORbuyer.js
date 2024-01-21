import { findSpanByAriaLabel, findButtonByInnerText } from "./utils_findbuttons.js";

function buyTorFrom(ns, company) {
    const foundSpan = findSpanByAriaLabel(company);
    if (foundSpan) {
        ns.print(`Found the span with 'aria-label' set to ${company}`);
        foundSpan.click();

        let torButton = findButtonByInnerText("Purchase TOR Router");
        if (torButton != null) {
            ns.print("Buying TOR router");
            torButton.click();
            return true;
        } else {
            ns.print("Couldn't find TOR purchase button or it's disabled!")
        }

    } else {
        ns.print(`No span with 'aria-label' set to '${company}' found in the document.`);
    }
    return false;
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    if (!ns.hasTorRouter()) {
        for (let i = 0; i < 100; i++) {
            if (buyTorFrom(ns, "Alpha Enterprises")) {
                i = 1000;
            }
            if (buyTorFrom(ns, "NetLink Technologies")) {
                i = 1000;
            }
            await ns.asleep(1000);
        }
    } else {
        ns.tprint("You've got a TOR router!");
    }
}