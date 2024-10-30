import { csv } from 'd3';
import { dsvFormat, csvParse } from 'd3-dsv';

const NUTS3 = csvParse(await Bun.file("srv/data/VAZ0108_0065_CS.csv").text());


const data = await Bun.file("srv/data/ORP20240819.csv").text();

const semicolonParser = dsvFormat(';');


const parsed = semicolonParser.parseRows(data, (d, i) => {
    if (i === 0) return null; // Skip the first row

    return {
        id: +d[0],
        name: d[1] === "Hlavní město Praha" ? "Praha" : d[1],
        //        nazevKraj: d[3],
        nuts: NUTS3.find((nuts3) => d[1] === nuts3.text2)?.chodnota1 ?? "CZ010",
    };
});


const krajs = NUTS3.map((nuts3) => ({
    id: nuts3.chodnota1,
    name: nuts3.text1,
}));
const uniqueKrajs = Array.from(new Map(krajs.map(kraj => [kraj.id, kraj])).values());


await Bun.write("src/assets/krajs.json", JSON.stringify(uniqueKrajs, null, 2));

await Bun.write("src/assets/orps.json", JSON.stringify(parsed, null, 2));