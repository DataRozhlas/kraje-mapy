import { csvParse } from "d3";

const properties = await Bun.file("srv/data/properties.json").json();
const topo = await Bun.file("srv/data/orp.topo.json").json();
const orps = await Bun.file("src/assets/orps.json").json();
//const raw = await Bun.file("srv/data/blokyorp.json").json();

const ucast = await Bun.file("srv/data/ucast-properties.json").json();

//console.log(properties);

const joined = properties.map((property: any) => {
  const orp = orps.find((orp: any) => orp.name === property.ORP);
  if (!orp) {
    console.log("ORP not found for property", property.id);
    return null;
  }
  const newProperties = ucast.find(
    (row: any) => row.KRAJ.includes(property.KRAJ) && row.ORP === property.ORP
  );
  if (!newProperties) {
    console.log("Properties not found for", property.KRAJ, property.ORP);
    return null;
  }
  return {
    ...property,
    UCAST20: newProperties.UCAST20,
    UCAST24: newProperties.UCAST24,
    orp,
  };
});

const newTopo = {
  ...topo,
  objects: {
    ...topo.objects,
    tracts: {
      ...topo.objects.tracts,
      geometries: topo.objects.tracts.geometries
        .filter((geometry: any) => geometry.properties.kraj_id !== "CZ010")
        .map((geometry: any) => {
          const orp = joined.find(
            (join: any) => join.orp.id === Number(geometry.id)
          );
          if (!orp) {
            console.log("ORP not found for geometry", geometry.id);
            return geometry;
          }
          return {
            ...geometry,
            properties: {
              ...geometry.properties,
              UCAST: orp.UCAST24 - orp.UCAST20,
            },
          };
        }),
    },
  },
};

await Bun.write(
  "src/assets/orp-enhanced.topo.json",
  JSON.stringify(newTopo, null, 2)
);

export {};
