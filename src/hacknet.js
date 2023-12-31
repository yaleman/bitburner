export function lvlUpProfit(stats) {
  return (1 * 1.5) * Math.pow(1.035, stats.ram - 1) * ((stats.cores + 5) / 6);
}
export function ramUpProfit(stats) {
  return (stats.level * 1.5) * (Math.pow(1.035, (2 * stats.ram) - 1) - Math.pow(1.035, stats.ram - 1)) * ((stats.cores + 5) / 6);
}
export function cpuUpProfit(stats) {
  return (stats.level * 1.5) * Math.pow(1.035, stats.ram - 1) * (1 / 6);
}

export function getHighestProfit(profits) {
  let highestProfitKey = '';
  let highestProfitValue = -Infinity;

  for (const key in profits) {
    if (profits[key] > highestProfitValue) {
      highestProfitValue = profits[key];
      highestProfitKey = key;
    }
  }
  return {
    "profit": highestProfitValue,
    "upgrade": highestProfitKey
  };
}

export async function hackNet(ns) {
  // ns.print("hacknet");
  var leavemoney = 0;

  if (ns.args.length == 0) {
    leavemoney = Math.round(ns.getPlayer().money * 0.5, 0);
  } else {
    leavemoney = ns.args[0];
  }

  const currmoney = Math.round(ns.getPlayer().money - leavemoney, 0);
  // ns.print(`have ${currmoney} to spend, leaving ${leavemoney}, args ${ns.args}`)

  var highestProfit = 0;
  var upgradeType = "";
  var nodeToUpgrade = -1;
  var upgradeCost = 0;

  for (var node = 0; node < ns.hacknet.numNodes(); node++) {
    let stats = ns.hacknet.getNodeStats(node);

    let profits = {};
    if (ns.hacknet.getLevelUpgradeCost(node) <= currmoney) {
      profits["level"] = lvlUpProfit(stats);
    }
    if (ns.hacknet.getRamUpgradeCost(node) <= currmoney) {
      profits["ram"] = ramUpProfit(stats);
    }

    if (ns.hacknet.getCoreUpgradeCost(node) <= currmoney) {
      profits["cpu"] = cpuUpProfit(stats);
    }


    if (Object.keys(profits).length > 0) {
      let blah = getHighestProfit(profits);
      if (blah.profit > highestProfit) {
        ns.tprint(`node ${node} is ready to upgrade`);
        upgradeType = blah.upgrade;
        highestProfit = blah.profit;
        nodeToUpgrade = node;
        switch (blah.upgrade) {
          case 'cpu':
            upgradeCost = ns.hacknet.getCoreUpgradeCost(node);
            break;
          case 'level':
            upgradeCost = ns.hacknet.getLevelUpgradeCost(node);
            break;
          case 'ram':
            upgradeCost = ns.hacknet.getRamUpgradeCost(node);
            break;
        }
      }
    }
  }

  if (upgradeCost > 0 && upgradeCost < ns.hacknet.getPurchaseNodeCost()) {
    ns.tprint(`upgrading ${upgradeType} on node #${nodeToUpgrade}`);
    switch (upgradeType) {
      case 'cpu':
        ns.hacknet.upgradeCore(nodeToUpgrade);
        break;
      case 'level':
        ns.hacknet.upgradeLevel(nodeToUpgrade);
        break;
      case 'ram':
        ns.hacknet.upgradeRam(nodeToUpgrade);
        break;
    }

  } else if (currmoney >= ns.hacknet.getPurchaseNodeCost()) {
    ns.tprint(`Buying a new node...`);
    ns.hacknet.purchaseNode();
  }
  await ns.asleep(100);
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');

  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    await hackNet(ns);
    await ns.asleep(1);

  }
}