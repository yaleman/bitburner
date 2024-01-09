/** @param {NS} ns */
function getSmolestServer(ns) {
    let myServers = ns.getPurchasedServers();
    let minRam = -1;
    let minRamServer;

    myServers.forEach((server) => {
        let stats = ns.getServer(server);
        if (stats.maxRam < minRam || minRam == -1) {
            minRam = stats.maxRam;
            minRamServer = server;
        }
    });
    return minRamServer;
}

/** @param {NS} ns */
export async function main(ns) {


    let myServers = ns.getPurchasedServers();
    let maxServers = ns.getPurchasedServerLimit();
    ns.tprint(`You have ${myServers.length}/${maxServers} servers`);
    var minRam = -1;
    var minRamServer;

    myServers.forEach((server) => {
        let stats = ns.getServer(server);
        ns.tprint(`- ${server} - ${stats.hostname} - ${stats.maxRam}GB - ${stats.cpuCores} cores`);

        if (stats.maxRam < minRam || minRam == -1) {
            minRam = stats.maxRam;
            minRamServer = server;
        }
    });

    if (minRam > 0) {
        ns.tprint(`minRamServer: ${minRamServer} - ${minRam}GB`);
    }

    if (ns.args.length == 0) {
        ns.tprint("buyservers: [buy | upgrade | smartbuy ]");
        return;
    }

    // const myMoney = ns.getPlayer().money;

    if (ns.args[0] === "upgrade") {
        if (myServers.length == 0) {
            ns.tprint("You don't have any servers to upgrade!");
            return;
        }
        if (ns.args.length == 1) {
            ns.tprint("usage: buyservers.js upgrade <maxram> <hostname>");
            return;
        }
        let targetram = ns.args[1];
        var targetServer = minRamServer;
        if (ns.args.length == 3) {
            targetServer = ns.args[2];
        }

        upgradeServer(ns, targetServer, targetram);
    }

    else if (ns.args[0] === "buy") {
        if (myServers.length >= maxServers) {
            ns.tprint("You already have the max servers!");
            return;
        }

        ns.tprint(`Biggest ram we can buy is ${getBiggestServerWeCanBuy(ns)} GB`);
        if (ns.args.length == 1) {
            ns.tprint("usage: buyservers.js buy <maxram>");
            return;
        }

        if (ns.args[1] > getBiggestServerWeCanBuy(ns)) {
            ns.tprint(`You can't afford a ${ns.args[1]} GB server!`);
            return;
        }
        let newHostName = makeHostName(ns);
        ns.purchaseServer(newHostName, ns.args[1]);
        ns.tprint(`Bought a ${ns.args[1]} GB server called ${newHostName}`);
    }

    else if (ns.args[0] === "smartbuy") {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let sharePower = Math.round((ns.getSharePower() - 1) * 100, 0);
            if (ns.args.length == 2) {
                ns.print(`Stopping smartbuy at ${ns.args[1]} percent helpage (and max servers), currently at ${sharePower}%`);
                if (sharePower >= ns.args[1] && ns.getPurchasedServers().length >= ns.getPurchasedServerLimit()) {
                    return;
                }
            }

            myServers = ns.getPurchasedServers();
            ns.print("####################################");
            ns.print(`You have ${myServers.length}/${maxServers} servers`);

            ns.getPurchasedServers().forEach((server) => {
                let stats = ns.getServer(server);
                ns.print(`- ${server} - ${stats.hostname} - ${stats.maxRam}GB - ${stats.cpuCores} cores`);
            });

            if (myServers.length < maxServers) {
                // we can buy more
                let biggestServer = getBiggestServerWeCanBuy(ns);
                if (biggestServer > 0) {
                    let newHostName = makeHostName(ns);
                    ns.purchaseServer(newHostName, biggestServer);
                }
            } else {
                let smolest = getSmolestServer(ns);
                if (smolest) {
                    let maxUpgrade = getBiggestServerWeCanBuy(ns);
                    if (maxUpgrade > 0) {
                        upgradeServer(ns, smolest, maxUpgrade);
                    }
                }
            }
            await ns.asleep(10);
        }
    }
}

/** @param {NS} ns */
function makeHostName(ns) {
    let newID = ns.getPurchasedServers().length;
    let newHostName = `foo-${newID}`;
    return newHostName;
}


/** @param {NS} ns */
function getBiggestServerWeCanBuy(ns) {
    let myMoney = ns.getPlayer().money;
    let biggestServer = 0;
    for (let i = 0; i < 20; i++) {
        if (myMoney < ns.getPurchasedServerCost(2 ** i)) {
            biggestServer = i - 1;
            break;
        }
    }
    return 2 ** biggestServer;
}

/** @param {NS} ns */
function upgradeServer(ns, hostname, maxRam) {
    let stats = ns.getServer(hostname);

    if (!isPowerOfTwo(maxRam)) {
        ns.tprint(`You can only upgrade to a power of two! Try ${Math.min(highestPowerOfTwo(maxRam), getBiggestServerWeCanBuy(ns))}`);
        return;
    }

    if (stats.maxRam >= maxRam) {
        // ns.tprint(`${hostname} is already ${stats.maxRam}GB`);
        return;
    }
    if (ns.getPurchasedServerUpgradeCost(hostname, maxRam) > ns.getPlayer().money) {
        ns.tprint("You can't afford that!");
        return;
    }
    ns.tprint(`Upgrading ${hostname} to ${maxRam}GB`);
    ns.upgradePurchasedServer(hostname, maxRam);
    // ns.tprint("Done!");

}


function isPowerOfTwo(number) {
    if (number <= 0) {
        return false;
    }
    return (number & (number - 1)) === 0;
}

function highestPowerOfTwo(number) {
    if (number <= 0) {
        return 1;
    }
    return Math.pow(2, Math.floor(Math.log2(number)));
}