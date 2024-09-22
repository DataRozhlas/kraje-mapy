import { parseStringPromise } from "xml2js";

const okresy = {
    "CZ0201": "Benešov",
    "CZ0202": "Beroun",
    "CZ0203": "Kladno",
    "CZ0204": "Kolín",
    "CZ0205": "Kutná Hora",
    "CZ0206": "Mělník",
    "CZ0207": "Mladá Boleslav",
    "CZ0208": "Nymburk",
    "CZ0209": "Praha-východ",
    "CZ020A": "Praha-západ",
    "CZ020B": "Příbram",
    "CZ020C": "Rakovník",
    "CZ0311": "České Budějovice",
    "CZ0312": "Český Krumlov",
    "CZ0313": "Jindřichův Hradec",
    "CZ0314": "Písek",
    "CZ0315": "Prachatice",
    "CZ0316": "Strakonice",
    "CZ0317": "Tábor",
    "CZ0321": "Domažlice",
    "CZ0322": "Klatovy",
    "CZ0323": "Plzeň-město",
    "CZ0324": "Plzeň-jih",
    "CZ0325": "Plzeň-sever",
    "CZ0326": "Rokycany",
    "CZ0327": "Tachov",
    "CZ0411": "Cheb",
    "CZ0412": "Karlovy Vary",
    "CZ0413": "Sokolov",
    "CZ0421": "Děčín",
    "CZ0422": "Chomutov",
    "CZ0423": "Litoměřice",
    "CZ0424": "Louny",
    "CZ0425": "Most",
    "CZ0426": "Teplice",
    "CZ0427": "Ústí nad Labem",
    "CZ0511": "Česká Lípa",
    "CZ0512": "Jablonec nad Nisou",
    "CZ0513": "Liberec",
    "CZ0514": "Semily",
    "CZ0521": "Hradec Králové",
    "CZ0522": "Jičín",
    "CZ0523": "Náchod",
    "CZ0524": "Rychnov nad Kněžnou",
    "CZ0525": "Trutnov",
    "CZ0531": "Chrudim",
    "CZ0532": "Pardubice",
    "CZ0533": "Svitavy",
    "CZ0534": "Ústí nad Orlicí",
    "CZ0631": "Havlíčkův Brod",
    "CZ0632": "Jihlava",
    "CZ0633": "Pelhřimov",
    "CZ0634": "Třebíč",
    "CZ0635": "Žďár nad Sázavou",
    "CZ0641": "Blansko",
    "CZ0642": "Brno-město",
    "CZ0643": "Brno-venkov",
    "CZ0644": "Břeclav",
    "CZ0645": "Hodonín",
    "CZ0646": "Vyškov",
    "CZ0647": "Znojmo",
    "CZ0711": "Jeseník",
    "CZ0712": "Olomouc",
    "CZ0713": "Prostějov",
    "CZ0714": "Přerov",
    "CZ0715": "Šumperk",
    "CZ0721": "Kroměříž",
    "CZ0722": "Uherské Hradiště",
    "CZ0723": "Vsetín",
    "CZ0724": "Zlín",
    "CZ0801": "Bruntál",
    "CZ0802": "Frýdek-Místek",
    "CZ0803": "Karviná",
    "CZ0804": "Nový Jičín",
    "CZ0805": "Opava",
    "CZ0806": "Ostrava-město",
};

const parties = [
    { name: "ANO", kstrana24: "39", kstrana20: "50" },
    { name: "Piráti", kstrana24: "21", kstrana20: "19" },
    { name: "ODS", kstrana24: "85", kstrana20: "33" },
];

const okresyArray = Object.keys(okresy).map((okres) => {
    return {
        nuts: okres,
        name: okresy[okres],
    };
});

const years = ["2024", "2020"];

interface PartyResult {
    name: string;
    votes: string | undefined;
}

interface ObecResult {
    okres: string;
    nuts: string;
    nazobec: string;
    cisobec: string;
    typobec: string;
    volici: string;
    obvyd: string;
    obod: string;
    plhl: string;
    parties: PartyResult[];
}

for (const year of years) {
    let results: ObecResult[] = [];

    for (const okres of okresyArray) {
        const url = year === "2024"
            ? `https://www.volby.cz/appdata/kz2024/odata/okresy/vysledky_okres_${okres.nuts}.xml`
            : `https://www.volby.cz/pls/kz2020/vysledky_okres?nuts=${okres.nuts}`;
        const response = await fetch(url);
        const xmlText = await response.text();
        const xmlDoc = await parseStringPromise(xmlText);
        const result = xmlDoc.VYSLEDKY_OKRES.OBEC.map((obec) => {
            return {
                okres: xmlDoc.VYSLEDKY_OKRES.OKRES[0].$.NAZ_OKRES,
                nuts: xmlDoc.VYSLEDKY_OKRES.OKRES[0].$.NUTS_OKRES,
                nazobec: obec.$.NAZ_OBEC,
                cisobec: obec.$.CIS_OBEC,
                typobec: obec.$.TYP_OBEC,
                volici: obec.UCAST[0].$.ZAPSANI_VOLICI,
                obvyd: obec.UCAST[0].$.VYDANE_OBALKY,
                obod: obec.UCAST[0].$.ODEVZDANE_OBALKY,
                plhl: obec.UCAST[0].$.PLATNE_HLASY,
                parties: parties.map((party) => {
                    return {
                        name: party.name,
                        votes: obec.HLASY_STRANA.find((hlasy) =>
                            year === "2020"
                                ? hlasy.$.KSTRANA === party.kstrana20
                                : hlasy.$.KSTRANA === party.kstrana24
                        )?.$.HLASY ?? undefined,
                    };
                }),
            };
        });
        results.push(...result);
        console.log(`Finished ${okres.name} ${year}`);
    }

    await Bun.write(
        `srv/data/obecResults${year}.json`,
        JSON.stringify(results, null, 2),
    );
}

export {};
