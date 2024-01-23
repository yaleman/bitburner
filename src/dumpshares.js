// dump all the things

/** @param {NS} ns */
export async function main(ns) {
    //Initialise
    ns.disableLog("ALL");
    //eslint-disable-next-line no-constant-condition
    while (true) {

        if (!ns.stock.hasTIXAPIAccess()) {
            ns.print("Waiting for TIX API access and 4S Market Data...");
            await ns.asleep(5000);
            continue;
        }
        if (!ns.stock.has4SData()) {
            ns.print("Waiting for 4S Market Data...");
            await ns.asleep(5000);
            continue;
        }
        if (!ns.stock.has4SDataTIXAPI()) {
            ns.print("Waiting for 4S Market Data TIX API...");
            await ns.asleep(5000);
            continue;
        }

        let symbols = ns.stock.getSymbols();
        ns.tprint(`Got symbols: ${symbols.join(", ")}`);
        let soldsome = false;

        for (const stock of symbols) {
            let sharesof = ns.stock.getPosition(stock)[0];
            if (sharesof > 0) {
                ns.tprint(`Selling ${sharesof} of ${stock}`);
                ns.stock.sellStock(stock, sharesof);
                soldsome = true;
            } else {
                ns.tprint(`don't have ${stock}`);
            }
        }

        if (!soldsome) {
            break;
        }

        await ns.asleep(1000);
    }
}