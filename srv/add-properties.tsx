const properties = await Bun.file("srv/data/properties.json").json();
const topo = await Bun.file("srv/data/orp.topo.json").json();
const orps = await Bun.file("src/assets/orps.json").json();

;

const joined = properties.map((property: any) => {
    const orp = orps.find((orp: any) => orp.name === property.ORP);
    if (!orp) {
        console.log("ORP not found for property", property.id);
        return null;
    }
    return {
        ...property,
        orp,
    };
});

// console.log(joined);


topo.objects.tracts.geometries

const newTopo = {
    ...topo,
    objects: {
        ...topo.objects,
        tracts: {
            ...topo.objects.tracts,
            geometries: topo.objects.tracts.geometries.map((geometry: any) => {
                const orp = joined.find((join: any) => join.orp.id === Number(geometry.id));
                if (!orp) {
                    console.log("ORP not found for geometry", geometry.id);
                    return geometry;
                }
                return {
                    ...geometry,
                    properties: {
                        ...geometry.properties,
                        ZNEV: orp.ZNEV,
                        CHUD: orp.CHUD,
                        KOALICE: orp.KOALICE,
                        OPOZICE: orp.OPOZICE,
                    },
                };
            }),
        },
    },
};

await Bun.write("src/assets/orp-enhanced.topo.json", JSON.stringify(newTopo, null, 2));

export { };