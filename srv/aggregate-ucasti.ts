import { csvParse } from "d3-dsv";

const ucastiData = await Bun.file("srv/data/2024/ucasti.csv").text();
const ucasti = csvParse(ucastiData);

const obecOkresData = await Bun.file("srv/data/VAZ0065_0043_CS.csv").text();
const obecOkres = csvParse(obecOkresData);

console.log(obecOkres);
