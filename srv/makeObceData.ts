import { csvParse } from "d3";

const topo = await Bun.file("srv/data/ob.json").json();
const d20 = await Bun.file("srv/data/obecResults2020.json").json();
const d24 = await Bun.file("srv/data/obecResults2024.json").json();

// const ciselnik = await Bun.file("srv/data/VAZ0109_0108_CS.csv").text().then(
//     (d) => csvParse(d),
// );

// const getKrajFromOkres = (okres: string) => {
//     const nuts = ciselnik.find((c) => c.chodnota1 === okres)?.chodnota2;
//     console.log(okres, nuts);
//     return nuts;
// };

const geometries = topo.objects.ob.geometries;

const data = geometries.map((geometry: any) => {
    const obec2020 = d20.find((obec: any) =>
        Number(obec.cisobec) === geometry.properties.kod
    );
    const obec2024 = d24.find((obec: any) =>
        Number(obec.cisobec) === geometry.properties.kod
    );

    if (!obec2020 || !obec2024) {
        console.log(
            "Obec not found for geometry",
            geometry.properties.CIS_OBEC,
        );
        return null;
    }

    return {
        ...geometry,
        properties: {
            ...geometry.properties,
            id: obec2020.cisobec,
            nuts: obec2020.nuts,
            ur: (obec2024.obvyd / obec2024.volici) * 100 -
                (obec2020.obvyd / obec2020.volici) * 100,
            d20: {
                v: obec2020.volici,
                u: obec2020.obvyd / obec2020.volici,
                h: obec2020.plhl,
                a: obec2020.parties.find((party) => party.name === "ANO")
                    ?.votes,
                p: obec2020.parties.find((party) => party.name === "Piráti")
                    ?.votes,
                o: obec2020.parties.find((party) => party.name === "ODS")
                    ?.votes,
            },
            d24: {
                v: obec2024.volici,
                u: obec2024.obvyd / obec2024.volici,
                h: obec2024.plhl,
                a: obec2024.parties.find((party) => party.name === "ANO")
                    ?.votes,
                p: obec2024.parties.find((party) => party.name === "Piráti")
                    ?.votes,
                o: obec2024.parties.find((party) => party.name === "ODS")
                    ?.votes,
            },
        },
    };
});

const newTopo = {
    ...topo,
    objects: {
        ...topo.objects,
        tracts: {
            ...topo.objects.ob,
            geometries: data,
        },
    },
};

await Bun.write(
    "src/assets/obces-enhanced.topo.json",
    JSON.stringify(newTopo, null, 2),
);

export {};
