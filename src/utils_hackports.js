
export async function hackPorts(ns, serverName) {
    // ns.tprint(`hackports ${serverName}`);

    var serverStats = ns.getServer(serverName);
    let requiredPorts = serverStats.numOpenPortsRequired;
    // await ns.asleep(1);
    let hackPortStats = ns.getServer(serverName);
    let hackedPorts = 0;


    if (hackPortStats.sshPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("BruteSSH.exe", "home")) {
        try {
            ns.tprint(`brutessh ${serverName}`);
            ns.brutessh(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't brutessh ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.ftpPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("FTPCrack.exe", "home")) {
        try {
            ns.tprint(`ftpcrack ${serverName}`);
            ns.ftpcrack(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't ftpcrack ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.smtpPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("relaySMTP.exe", "home")) {
        try {
            ns.tprint(`relaysmtp ${serverName}`);
            ns.relaysmtp(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't relaysmtp ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.httpPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("HTTPWorm.exe", "home")) {
        try {
            ns.tprint(`HTTPWorm ${serverName}`);
            ns.httpworm(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't httpworm ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }

    if (hackPortStats.sqlPortOpen) {
        hackedPorts++;
    } else if (ns.fileExists("SQLInject.exe", "home")) {
        try {
            ns.tprint(`sqlinject ${serverName}`);
            ns.sqlinject(serverName);
            hackedPorts++;
        } catch (err) {
            ns.tprint(`Couldn't sqlinject ${serverName} due to port hacking err ${err}`);
        }
    }
    if (hackedPorts >= requiredPorts) {
        ns.tprint(`returning from hackports ${serverName}`);
        return hackedPorts;
    }


    await ns.asleep(1);
    return hackedPorts;
}
