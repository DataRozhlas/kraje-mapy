import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Topology } from "topojson-specification"
import { FeatureCollection } from 'geojson';

import topoData_ from '../assets/orp-enhanced.topo.json';

const topoData: Topology = topoData_ as any;

function getMinMax(data: any[], property: string) {

    let min = Infinity;
    let max = -Infinity;

    data.forEach((item) => {
        const value = item.properties[property];
        if (value < min) {
            min = value;
        }
        if (value > max) {
            max = value;
        }
    });

    return [min, max];
}


function Map({ kraj, property }: { kraj: string, property: string }) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    let title;
    switch (property) {
        case "ZNEV":
            title = "Socioekonomické znevýhodnění";
            break;
        case "CHUD":
            title = "Destabilizující chudoba";
            break;
        case "KOALICE":
            title = "Volební výsledek koalice";
            break;
        case "OPOZICE":
            title = "Volební výsledek opozice";
            break;
        default:
            title = "Nevím";
    }


    const updateDimensions = () => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            const filteredGeodata = (kraj === "" ? geodata : { ...geodata, features: geodata.features.filter(item => item.properties?.kraj_id === kraj) } as FeatureCollection);

            projection.fitSize([width, width], filteredGeodata);

            const [[x0, y0], [x1, y1]] = d3.geoPath(projection).bounds(filteredGeodata);
            const aspectRatio = (y1 - y0) / (x1 - x0);
            const height = Math.ceil(width * aspectRatio);

            setDimensions({ width, height });
        }
    };

    useEffect(() => {
        console.log(kraj);
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [kraj]);

    const geodata = feature(topoData, topoData.objects.tracts) as FeatureCollection;

    const filteredGeodata = (kraj === "" ? geodata : { ...geodata, features: geodata.features.filter(item => item.properties?.kraj_id === kraj) } as FeatureCollection);


    const projection = d3.geoMercator();
    const geoPathGenerator = d3.geoPath().projection(projection);

    projection.fitSize([dimensions.width, dimensions.height], filteredGeodata);


    // Create a color scale
    let colorInterpolator;
    switch (property) {
        case "ZNEV": colorInterpolator = d3.interpolateOranges;
            break;
        case "CHUD": colorInterpolator = d3.interpolateReds;
            break;
        case "KOALICE": colorInterpolator = d3.interpolatePurples;
            break;
        case "OPOZICE": colorInterpolator = d3.interpolateBlues;
            break;
        default: colorInterpolator = d3.interpolateOranges;
    }


    ;

    const colorScale = d3.scaleSequential(colorInterpolator).domain(getMinMax(geodata.features, property));

    return (
        <div ref={containerRef} >
            <div className={"text-lg font-bold pb-2"}>
                {title}
            </div>
            <svg width={dimensions.width} height={dimensions.height}>
                {filteredGeodata.features.map((shape) => (
                    <path
                        key={shape.id} // Add null check
                        d={geoPathGenerator(shape) || undefined}
                        stroke="silver"
                        strokeWidth={0.5}
                        fill={shape.properties ? colorScale(shape.properties[property]) : undefined}
                    />
                ))}
            </svg>
        </div>
    );
};


export default Map;