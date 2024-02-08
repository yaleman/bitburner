// async function shareTick(ns) {
//     if (!ns.stock.hasWSEAccount()) {
//         ns.stock.purchaseWseAccount()
//     }
//     if (!ns.stock.hasTIXAPIAccess()) {
//         if (stats.money > 100000) {
//             ns.tprint("Purchasing TIX API access");
//             ns.stock.purchaseTixApi()
//         }
//     } else if (!ns.stock.has4SData()) {
//         ns.stock.purchase4SMarketData();
//     } else if (!ns.stock.has4SDataTIXAPI()) {
//         if (stats.money > 25000000000) {
//             ns.stock.purchase4SMarketDataTixApi();
//         }
//     } else {
//         return
//     }
//     await ns.asleep(1000);
// }

// /** @param {NS} ns */
// export async function main(ns) {
//     //Initialise

//     ns.disableLog('asleep');
//     let stats = ns.getPlayer();

//     //eslint-disable-next-line no-constant-condition
//     while (true) {

//     }
// }