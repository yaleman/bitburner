// Based on a script from https://www.reddit.com/r/Bitburner/comments/uaebqt/bitburner_stock_market_script/

let fracH = 0.5;
let commission = 100000; //Buy or sell commission
let numCycles = 2;   //Each cycle is 5 seconds
let expRetLossToSell = -0.4; // As a percent, the amount of change between the initial
// forecasted return and the current return of the stock. I.e. -40% less forecasted return now
// than when we purchased the stock.

// where we keep our sekrets
const SHAREDATA = "shares.txt";

/**
Saves the data for restoration on restart
*/

function writeShareData(ns, shares, filename) {
    ns.write(filename, JSON.stringify(shares), "w");
}

/**
Loads the data for restoration on restart, if the playtime is higher than the current "time since last reset"
then the user has restarted and they can start again fresh.
*/
function readShareData(ns, filename) {
    ns.tprint(`reading share list from ${filename}`);
    let filecontents = ns.read(filename);
    let playtime = ns.getResetInfo().lastAugReset;

    if (filecontents.length == 0) {
        ns.tprint("got empty file");
        return { "playtime": playtime, "stocks": [] };
    }
    try {
        let res = JSON.parse(filecontents);
        ns.tprint(`read share data from ${filename}`);
        if (playtime < res.playtime) {
            ns.tprint(`playtime ${playtime} < ${res.playtime}, resetting`);
            return { "playtime": playtime, "stocks": [] }
        }
        return res;
    } catch (err) {
        ns.tprint(`failed to read ${filename}: ${err}`);
        return { "playtime": playtime, "stocks": [] };
    }
}


function pChange(ns, sym, oldNum, newNum) {
    const diff = newNum < oldNum ? -(oldNum - newNum) : newNum - oldNum;
    let pdiff = diff / oldNum;
    ns.print(`${sym}:\t${oldNum.toFixed(5)} -> ${newNum.toFixed(5)} | ${(pdiff * 100).toFixed(3)}%`);
    return pdiff
}

function refresh(ns, stocks, myStocks) {
    let corpus = ns.getServerMoneyAvailable("home");
    myStocks.length = 0;
    for (let i = 0; i < stocks.length; i++) {
        let sym = stocks[i].sym;
        stocks[i].price = ns.stock.getPrice(sym);
        stocks[i].shares = ns.stock.getPosition(sym)[0];
        stocks[i].buyPrice = ns.stock.getPosition(sym)[1];
        stocks[i].vol = ns.stock.getVolatility(sym);
        stocks[i].prob = 2 * (ns.stock.getForecast(sym) - 0.5);
        stocks[i].expRet = stocks[i].vol * stocks[i].prob / 2;
        if (stocks[i].shares > 0) {
            stocks[i].initExpRet ||= stocks[i].expRet;
        } else {
            stocks[i].initExpRet = null;
        }

        corpus += stocks[i].price * stocks[i].shares;
        if (stocks[i].shares > 0) myStocks.push(stocks[i]);
    }
    stocks.sort(function (a, b) { return b.expRet - a.expRet });
    writeShareData(ns, { "stocks": stocks, "playtime": ns.getResetInfo().lastAugReset }, SHAREDATA);
    return corpus;
}

function format(num) {
    // return Math.round(num)
    let symbols = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];
    let i = 0;
    for (; (num >= 1000) && (i < symbols.length); i++) num /= 1000;

    return `${((Math.sign(num) < 0) ? "-$" : "$")}${Math.abs(num.toFixed(3))}${symbols[i]}`;
}

async function buy(ns, stock, numShares) {
    const max = ns.stock.getMaxShares(stock.sym)
    numShares = max < numShares ? max : numShares;
    await ns.stock.buyStock(stock.sym, numShares);
    ns.tprint(`Bought ${stock.sym} for ${format(numShares * stock.price)}`);
}

async function sell(ns, stock, numShares) {
    let profit = numShares * ((stock.price - stock.buyPrice) - (2 * commission));
    await ns.stock.sellStock(stock.sym, numShares);
    ns.tprint(`Sold ${stock.sym} for profit of ${format(profit)}`);
}


async function shareTick(ns) {
    if (!ns.stock.hasWSEAccount()) {
        if (ns.getPlayer().money > 200000000) {
            ns.stock.purchaseWseAccount()
        } else {
            ns.print("Waiting for WSE Account...");
            return
        }
    }
    if (!ns.stock.hasTIXAPIAccess()) {
        if (ns.getPlayer().money > 5000000000) {
            ns.stock.purchaseTixApi()
        } else {
            ns.print("Waiting for TIX API access and 4S Market Data...");
            return;
        }
    } else if (!ns.stock.has4SData()) {
        if (ns.getPlayer().money > 1000000000) {
            ns.stock.purchase4SMarketData();
        } else {
            ns.print("Waiting for 4S Market Data...");
            return;
        }
    } else if (!ns.stock.has4SDataTIXAPI()) {
        if (ns.getPlayer().money > 25000000000) {
            ns.stock.purchase4SMarketDataTixApi();
        } else {
            ns.print("Waiting for 4S Market Data TIX API...");
            return;
        }
    }

    let loaddata = readShareData(ns, SHAREDATA);

    let stocks = [];
    if (loaddata.stocks.length == 0) {
        stocks = [...ns.stock.getSymbols().map(_sym => { return { sym: _sym } })];
    } else {
        stocks = loaddata.stocks;

    }


    let myStocks = [];
    let corpus = 0;

    // eslint-disable-next-line no-constant-condition
    // while (true) {
    corpus = refresh(ns, stocks, myStocks);
    //Symbol, Initial Return, Current Return, The % change between
    // the Initial Return and the Current Return.
    ns.print("Currently Owned Stocks:")
    ns.print("SYM | InitReturn -> CurReturn | % change")
    //Sell underperforming shares
    for (let i = 0; i < myStocks.length; i++) {
        if (pChange(ns, myStocks[i].sym, myStocks[i].initExpRet, myStocks[i].expRet) <= expRetLossToSell)
            await sell(ns, myStocks[i], myStocks[i].shares);

        if (myStocks[i].expRet <= 0)
            await sell(ns, myStocks[i], myStocks[i].shares);

        corpus -= commission;
    }
    ns.print("----------------------------------------")

    //Buy shares with cash remaining in hand
    for (let stock of stocks) {
        if (stock.shares > 0) continue;
        if (stock.expRet <= 0) continue;
        let cashToSpend = ns.getServerMoneyAvailable("home") - (fracH * corpus);
        let numShares = Math.floor((cashToSpend - commission) / stock.price);
        if ((numShares * stock.expRet * stock.price * numCycles) > commission)
            await buy(ns, stock, numShares);
        break;
    }
}

/** @param {NS} ns */
export async function main(ns) {
    //Initialise
    ns.disableLog("ALL");
    //eslint-disable-next-line no-constant-condition
    while (true) {

        await shareTick(ns);
        await ns.sleep(5 * 1000 * numCycles + 200);
        // }
    }
}