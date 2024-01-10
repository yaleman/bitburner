/// does gang things

/** @param {NS} ns */
function everyoneTask(ns, task) {
    ns.gang.getMemberNames().forEach((memberName) => {
        ns.gang.setMemberTask(memberName, task);

    });

}

/** @param {NS} ns */
function everyoneVigilante(ns) {
    everyoneTask(ns, 'Vigilante Justice');
}

/** @param {NS} ns */
function everyoneMug(ns) {
    everyoneTask(ns, 'Mug People');
}

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL');

    let allState = "";


    // eslint-disable-next-line no-constant-condition
    while (true) {
        let gangInfo = ns.gang.getGangInformation();

        if (gangInfo.wantedPenalty > 2.0) {
            everyoneVigilante(ns);
            allState = "vigilante";
        } else if (allState != "mugging") {
            ns.tprint(`We are not wanted, so we are mugging. penalty: ${gangInfo.wantedPenalty}`);
            everyoneMug(ns);
            allState = "mugging";
        }
        ns.print(gangInfo);
        if (ns.gang.canRecruitMember()) {
            let newName = `member${String(ns.gang.getMemberNames().length).padStart(3, '0')}`;
            if (ns.gang.recruitMember(newName)) {
                ns.tprint(`Recruited ${newName}`);
                allState = "";
            } else {
                ns.tprint(`Failed to recruit ${newName}`);
            }
        }
        await ns.asleep(1000);

    }


}