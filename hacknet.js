async function spider(ns, serverList) {

  try {
    let badnames = ['darkweb', '0', 0, ".", "home"];
    var newlist = serverList.slice();
    for (var target of serverList) {
      for (var scanTarget of ns.scan(target)) {
        if (!badnames.includes(scanTarget) && !newlist.includes(scanTarget)) {
          ns.print(`adding ${scanTarget} to list`);
          newlist.push(scanTarget);
        }
      }
    }
  } catch {
    ns.print(`spider failed on ${serverList}`);
    await ns.asleep(1);
  }
  return [...new Set(newlist)];
}

/** @param {NS} ns */
export async function main(ns) {
  // ns.disableLog('ALL');
  var serverList = ["home"];

  while (true) {
    try {
      let myHackingLevel = ns.getPlayer().skills.hacking;
      serverList = await spider(ns, serverList);
      let hackedServers = [];
      for (let server of serverList) {

        if (!ns.hasRootAccess(server)) {
          if (ns.getServerRequiredHackingLevel(server) <= myHackingLevel) {
            ns.print(`hacking ${server}`);
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
              // ns.print(`Could not hack port on ${server}`);
            }
            try {
              ns.nuke(server);
            } catch {
              ns.print(`Could not nuke ${server}`);
            }
          }
        }
        else if (server != "home" && server != "darkweb") {
          hackedServers.push(server);
          var processes = ns.ps(server);
          var skippableBasic = 0;
          var skippableShare = 0;
          for (let process of processes) {
            if (process.filename == "basichack.js") {
              skippableBasic = 1;
            }
            if (process.filename == "share.js") {
              skippableShare += 1;
            }
          };
          if (skippableBasic == 0) {
            ns.scp("basichack.js", server);
            ns.exec("basichack.js", server, 1, server);
          }
          if (skippableShare < 3) {
            ns.scp("share.js", server);
            ns.exec("share.js", server, 1);
          }

        }
      }
      ns.print(new Date().toISOString());
      ns.print(`hacked servers: ${hackedServers.length}`);
      ns.print(`servers: ${serverList.length}`);
      ns.print(`sharepower ${ns.getSharePower()}\n\n`);
    } catch {
      ns.print(`failed on ${serverList}`);
    }
    await ns.asleep(10);
  }

}