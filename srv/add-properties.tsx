import { csvParse } from "d3";



const properties = await Bun.file("srv/data/properties.json").json();
const topo = await Bun.file("srv/data/orp.topo.json").json();
const orps = await Bun.file("src/assets/orps.json").json();
const raw = await Bun.file("srv/data/blokyorp.csv").text().then(d => csvParse(d));

console.log(properties);





const joined = properties.map((property: any) => {
    const orp = orps.find((orp: any) => orp.name === property.ORP);
    if (!orp) {
        console.log("ORP not found for property", property.id);
        return null;
    }
    const newProperties = raw.filter((row: any) => row.KRAJ === property.KRAJ && row.ORP === property.ORP);
    return {
        ...property,
        KOA24: Number(newProperties.find((row: any) => row.BLOK === "koalice")?.HLASYPROC),
        OPO24: Number(newProperties.find((row: any) => row.BLOK === "opozice")?.HLASYPROC),
        orp,
    };
});

const newTopo = {
    ...topo,
    objects: {
        ...topo.objects,
        tracts: {
            ...topo.objects.tracts,
            geometries: topo.objects.tracts.geometries.filter((geometry: any) => geometry.properties.kraj_id !== "CZ010").map((geometry: any) => {
                const orp = joined.find((join: any) => join.orp.id === Number(geometry.id));
                if (!orp) {
                    console.log("ORP not found for geometry", geometry.id);
                    return geometry;
                }
                return {
                    ...geometry,
                    properties: {
                        ...geometry.properties,
                        KOALICE: orp.KOA24 - orp.KOALICE,
                        OPOZICE: orp.OPO24 - orp.OPOZICE,
                    },
                };
            }),
        },
    },
};

await Bun.write("src/assets/orp-enhanced.topo.json", JSON.stringify(newTopo, null, 2));

export { };