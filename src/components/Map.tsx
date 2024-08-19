import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Topology } from "topojson-specification"
import { FeatureCollection } from 'geojson';

import topoData_ from '../assets/orp.topo.json';

const topoData: Topology = topoData_ as any;


const geodata = feature(topoData, topoData.objects.tracts) as FeatureCollection;


function Map({ kraj }: { kraj: string }) {
    const projection = d3.geoMercator();
    const geoPathGenerator = d3.geoPath().projection(projection);


    // Fit the map to the container
    projection.fitSize([620, 620], geodata);

    const colorInterpolator = d3.interpolateOranges;

    // Create a color scale
    const colorScale = d3.scaleSequential(colorInterpolator).domain([1, 100]);

    return (
        <svg width={620} height={620}>
            {geodata.features.map((shape) => (
                <path
                    key={shape.id} // Add null check
                    d={geoPathGenerator(shape) || undefined}
                    stroke="silver"
                    strokeWidth={0.5}
                    fill={colorScale(shape.properties?.value || 0)}
                />
            ))}
        </svg>
    );
};


export default Map;