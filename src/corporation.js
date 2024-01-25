// If your employees have low morale or energy, their production will greatly suffer. Having enough interns will make sure those stats get high and stay high.
// const requriedInterns = 1 / 9;

// -Start with one division, such as Agriculture. Get it profitable on it's own, then expand to a division that consumes/produces a material that the division you selected produces/consumes.

// -Materials are profitable, but Products are where the real money is, although if the product had a low development budget or is produced with low quality materials it won't sell well.

// -The 'Smart Supply' upgrade is extremely useful. Consider purchasing it as soon as possible.

// -Purchasing Hardware, Robots, AI Cores, and Real Estate can potentially increase your production. The effects of these depend on what industry you are in.

// -In order to optimize your production, you will need a good balance of all employee positions, about 1/9 should be interning

// -Quality of materials used for production affects the quality/effective rating of materials/products produced, so vertical integration is important for high profits.

// -Materials purchased from the open market are always of quality 1.

// -The price at which you can sell your Materials/Products is highly affected by the quality/effective rating

// -When developing a product, different employee positions affect the development process differently, some improve the development speed, some improve the rating of the finished product.

// -If your employees have low morale or energy, their production will greatly suffer. Having enough interns will make sure those stats get high and stay high.

// -Don't forget to advertise your company. You won't have any business if nobody knows you.

// -Having company awareness is great, but what's really important is your company's popularity. Try to keep your popularity as high as possible to see the biggest benefit for your sales

/** @param {NS} ns */
export async function main(ns) {


    ns.disableLog('ALL');

    for (let i = 0; i < 1e100; i++) {
        if (!ns.corporation.hasCorporation()) {
            ns.tprint("no corporation yet!");
        } else {
            ns.tprint("You've got a corp, carrying on...")
            break;
        }

        await ns.asleep(5000);

    }

    let corpStats = ns.corporation.getCorporation();
    ns.tprint(corpStats);

    // {
    //     "name": "MonkeyButlers",
    //         "funds": 150000000000,
    //             "revenue": 0,
    //                 "expenses": 0,
    //                     "public": false,
    //                         "totalShares": 1500000000,
    //                             "numShares": 1000000000,
    //                                 "shareSaleCooldown": 0,
    //                                     "investorShares": 500000000,
    //                                         "issuedShares": 0,
    //                                             "issueNewSharesCooldown": 0,
    //                                                 "sharePrice": 0.011392014344470435,
    //                                                     "dividendRate": 0,
    //                                                         "dividendTax": 0.15,
    //                                                             "dividendEarnings": 0,
    //                                                                 "nextState": "EXPORT",
    //                                                                     "prevState": "PRODUCTION",
    //                                                                         "divisions": [],
    //                                                                             "state": "EXPORT"
    // }
    if (corpStats.divisions.length == 0) {
        for (let i = 0; i < 1e100; i++) {
            ns.tprint("Buy Agriculture industry Agriculture001...")
            await ns.await(5000);
        }

        // ns.corporation.expandIndustry("Agriculture", "Agriculture001");
    }


    // ns.tprint(ns.corporation.hasUnlock("Smartbuy"));

    corpStats = ns.corporation.getCorporation();

    for (let divisionIndex in corpStats.divisions) {
        let divisionName = corpStats.divisions[divisionIndex];
        ns.tprint(`####################################\ndivision: ${divisionName}`);
        let divisionInfo = ns.corporation.getDivision(divisionName);
        ns.tprint(divisionInfo);

        for (let cityIndex in divisionInfo.cities) {

            let warehouseInfo = ns.corporation.getWarehouse(divisionName, divisionInfo.cities[cityIndex]);
            ns.tprint(`city: ${divisionInfo.cities[cityIndex]}`, warehouseInfo);
        }
    }
}