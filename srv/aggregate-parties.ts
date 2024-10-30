import { csvParse, } from "d3";

const parties = await Bun.file("srv/data/2024/stranyorp.csv").text().then(d => csvParse(d));


const adjusted = parties.map((party: any) => {
    return {
        ...party,
        BLOK: party.STRANA === "PŘÍSAHA občanské hnutí" ? "koalice" : party.BLOK,
    };
})

// aggregate results by BLOK and ORP
const aggregated = adjusted.reduce((acc: any, party: any) => {
    const key = [party.BLOK, party.ORP];
    const existing = acc.find((item: any) => item.BLOK === key[0] && item.ORP === key[1]);
    if (existing) {
        existing.HLASYABS += Number(party.HLASYABS);
    } else {
        acc.push({
            KRAJ: party.KRAJ,
            ORP: key[1],
            BLOK: key[0],
            HLASYABS: Number(party.HLASYABS),
            HLASYOBEC: Number(party.HLASYOBEC),
        });
    }
    return acc;
}, []);

const result = aggregated.map((party: any) => {
    return {
        KRAJ: party.KRAJ,
        ORP: party.ORP,
        BLOK: party.BLOK,
        HLASYPROC: party.HLASYABS / party.HLASYOBEC * 100,
    };
});

Bun.write("srv/data/blokyorp.json", JSON.stringify(result, null, 2));


