

export const SERVER_FILENAME = "knownservers.txt";


export function writeServerList(ns, serverList, filename) {
    ns.write(filename, JSON.stringify(serverList), "w");
}


export function readServerList(ns, filename) {
    ns.tprint(`reading server list from ${filename}`);
    let filecontents = ns.read(filename);
    if (filecontents.length == 0) {
        ns.tprint("got empty file");
        ns.tprint(`file: ${filecontents}`)
        return ["home"];
    }

    try {
        let res = JSON.parse(filecontents);
        ns.tprint(`read ${res.length} servers from ${filename}`);
        return res;
    } catch (err) {
        ns.tprint(`failed to read ${filename}: ${err}`);
        return ["home"];
    }
}