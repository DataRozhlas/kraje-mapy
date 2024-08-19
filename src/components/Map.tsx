import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Topology } from "topojson-specification"
import { FeatureCollection } from 'geojson';

import topoData_ from '../assets/orp-enhanced.topo.json';

const topoData: Topology = topoData_ as any;




function Map({ kraj }: { kraj: string }) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const updateDimensions = () => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            const geodata = feature(topoData, topoData.objects.tracts) as FeatureCollection;
            const filteredGeodata = { ...geodata, features: geodata.features.filter(item => item.properties?.kraj_id === kraj) } as FeatureCollection;

            const projection = d3.geoMercator();
            projection.fitSize([width, width], filteredGeodata);

            const [[x0, y0], [x1, y1]] = d3.geoPath(projection).bounds(filteredGeodata);
            const aspectRatio = (y1 - y0) / (x1 - x0);
            const height = Math.ceil(width * aspectRatio);

            setDimensions({ width, height });
        }
    };

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [kraj]);

    const geodata = feature(topoData, topoData.objects.tracts) as FeatureCollection;

    const filteredGeodata = { ...geodata, features: geodata.features.filter(item => item.properties?.kraj_id === kraj) } as FeatureCollection;


    const projection = d3.geoMercator();
    const geoPathGenerator = d3.geoPath().projection(projection);

    projection.fitSize([dimensions.width, dimensions.height], filteredGeodata);

    // Fit the map to the container
    const colorInterpolator = d3.interpolateOranges;

    // Create a color scale
    const colorScale = d3.scaleSequential(colorInterpolator).domain([1, 100]);

    return (
        <div ref={containerRef} style={{ width: '100%' }}>

            <svg width={dimensions.width} height={dimensions.height}>
                {filteredGeodata.features.map((shape) => (
                    <path
                        key={shape.id} // Add null check
                        d={geoPathGenerator(shape) || undefined}
                        stroke="silver"
                        strokeWidth={0.5}
                        fill={colorScale(Number(shape.id) || 0)}
                    />
                ))}
            </svg>
        </div>
    );
};


export default Map;