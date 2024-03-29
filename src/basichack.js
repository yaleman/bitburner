/** @param {NS} ns */
export async function main(ns) {
    if (ns.args.length == 0) {
        ns.tprint("usage: basichack.js <target>");
        return;
    }

    // Defines the "target server", which is the server
    // that we're going to hack.
    const target = ns.args[0];
    if (!ns.serverExists(target)) {
        ns.tprint(`from: ${ns.getHostName()} - ${target} does not exist!`);
    }

    if (!ns.hasRootAccess(target)) {
        // If we have the BruteSSH.exe program, use it to open the SSH Port
        // on the target server
        try {
            if (ns.fileExists("BruteSSH.exe", "home")) {
                ns.brutessh(target);
            }
            if (ns.fileExists("FTPCrack.exe", "home")) {
                ns.ftpcrack(target);
            }
            if (ns.fileExists("relaySMTP.exe", "home")) {
                ns.relaysmtp(target);
            }
            if (ns.fileExists("HTTPWorm.exe", "home")) {
                ns.httpworm(target);
            }
            if (ns.fileExists("SQLInject.exe", "home")) {
                ns.sqlinject(target);
            }

        } catch {
            ns.print(`Could not hack port on ${target}`);
        }
        try {
            ns.nuke(target);
        } catch {
            ns.print(`Could not nuke ${target}`);
        }
    }


    // Infinite loop that continously hacks/grows/weakens the target server
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        // Defines how much money a server should have before we hack it
        let moneyThresh = ns.getServerMaxMoney(target) * 0.75;

        // Defines the maximum security level the target server can
        // have. If the target's security level is higher than this,
        // we'll weaken it before doing anything else
        let securityThresh = ns.getServerMinSecurityLevel(target);


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
        await ns.asleep(10);
    }
}