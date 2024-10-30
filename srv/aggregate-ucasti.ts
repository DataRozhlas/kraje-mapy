import { csvParse } from "d3-dsv";

const obecORPData = await Bun.file("srv/data/VAZ0065_0043_CS.csv").text();
const obecORP = csvParse(obecORPData);

const ORPSData = await Bun.file("srv/data/VAZ0108_0065_CS.csv").text();
const ORPS = csvParse(ORPSData);

import obecResults2024 from "./data/obecResults2024.json";
import obecResults2020 from "./data/obecResults2020.json";

const result = ORPS.filter((o) => o.text2 !== "Praha")
  .map((o) => {
    return {
      KRAJ: o.text1,
      ORP: o.text2,
      UCAST20: obecORP
        .filter((obec) => obec.text1 === o.text2)
        .map((obec) => obec.chodnota2)
        .reduce(
          (acc, curr) => {
            const obceResults = obecResults2020.filter(
              (obec) => obec.cisobec === curr && obec.typobec !== "MCMO"
            );
            acc.obvyd += obceResults.reduce(
              (acc, curr) => acc + Number(curr.obvyd),
              0
            );
            acc.volici += obceResults.reduce(
              (acc, curr) => acc + Number(curr.volici),
              0
            );
            return acc;
          },
          {
            obvyd: 0,
            volici: 0,
          }
        ),
      UCAST24: obecORP
        .filter((obec) => obec.text1 === o.text2)
        .map((obec) => obec.chodnota2)
        .reduce(
          (acc, curr) => {
            const obceResults = obecResults2024.filter(
              (obec) => obec.cisobec === curr && obec.typobec !== "MCMO"
            );
            acc.obvyd += obceResults.reduce(
              (acc, curr) => acc + Number(curr.obvyd),
              0
            );
            acc.volici += obceResults.reduce(
              (acc, curr) => acc + Number(curr.volici),
              0
            );
            return acc;
          },
          { obvyd: 0, volici: 0 }
        ),
    };
  })
  .map((o) => {
    return {
      ...o,
      UCAST20: Math.round((o.UCAST20.obvyd / o.UCAST20.volici) * 10000) / 100,
      UCAST24: Math.round((o.UCAST24.obvyd / o.UCAST24.volici) * 10000) / 100,
    };
  });

Bun.write("srv/data/ucast-properties.json", JSON.stringify(result, null, 2));
