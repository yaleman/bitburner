/** @param {NS} ns */
export async function main(ns) {

    // Defines the "target server", which is the server
    // that we're going to hack.
    const target = ns.args[0];
    console.log(`target: ${target}`);

    // Defines how much money a server should have before we hack it
    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
    const securityThresh = ns.getServerMinSecurityLevel(target);

    if (!ns.hasRootAccess(target)) {
        // If we have the BruteSSH.exe program, use it to open the SSH Port
        // on the target server
        try {
            if (ns.fileExists("BruteSSH.exe", "home")) {
                ns.brutessh(server);
            }
            if (ns.fileExists("FTPCrack.exe", "home")) {
                ns.ftpcrack(server);
            }
            if (ns.fileExists("relaySMTP.exe", "home")) {
                ns.relaysmtp(server);
            }
            if (ns.fileExists("HTTPWorm.exe", "home")) {
                ns.httpworm(server);
            }
            if (ns.fileExists("SQLInject.exe", "home")) {
                ns.sqlinject(server);
            }

        } catch {
            ns.print(`Could not hack port on ${server}`);
        }
        try {
            ns.nuke(server);
        } catch {
            ns.print(`Could not nuke ${server}`);
        }
    }


    // Infinite loop that continously hacks/grows/weakens the target server
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < (moneyThresh)) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        }
        if (ns.getServerMoneyAvailable(target) > 0) {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }
}