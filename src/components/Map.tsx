import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { Topology } from "topojson-specification";
import { FeatureCollection } from "geojson";

import BeeSwarm from "./BeeSwarm";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
} from "@/components/ui/tooltip";

import topoData_ from "../assets/obces-enhanced.topo.json";

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

function Map({
  kraj,
  property,
  activeTooltip,
  setTooltip,
  boundary,
}: {
  kraj: string;
  property: string;
  activeTooltip: string;
  setTooltip: Function;
  boundary: React.RefObject<HTMLDivElement>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  let title;
  let suffix: string;
  switch (property) {
    case "ur":
      title = "Volební účast - změna";
      suffix = " p. b.";
      break;
    default:
      title = "Nevím";
  };

  let subtitle;
  switch (property) {
    case "ur":
      subtitle = "Jak se změnila volební účast od roku 2020";
      break;
    default:
      subtitle = "";
  };

  const updateDimensions = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth - 15;
      const filteredGeodata =
        kraj === ""
          ? geodata
          : ({
            ...geodata,
            features: geodata.features.filter(
              (item) => item.properties?.kraj_id === kraj,
            ),
          } as FeatureCollection);

      projection.fitSize([width, width], filteredGeodata);

      const [[x0, y0], [x1, y1]] = d3
        .geoPath(projection)
        .bounds(filteredGeodata);
      const aspectRatio = (y1 - y0) / (x1 - x0);
      const height =
        Math.ceil(width * aspectRatio) < width
          ? Math.ceil(width * aspectRatio)
          : width;

      setDimensions({ width, height });
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [kraj]);

  const geodata = feature(
    topoData,
    topoData.objects.tracts,
  ) as FeatureCollection;

  const filteredGeodata =
    kraj === ""
      ? geodata
      : ({
        ...geodata,
        features: geodata.features.filter(
          (item) => item.properties?.nuts.slice(0, -1) === kraj, // convert nuts3 to nuts2
        ),
      } as FeatureCollection);

  const projection = d3.geoMercator();
  const geoPathGenerator = d3.geoPath().projection(projection);

  projection.fitSize([dimensions.width, dimensions.height], filteredGeodata);

  // Create a color scale
  let colorInterpolator;
  switch (property) {
    case "ur":
      colorInterpolator = d3.interpolateRgb("#e6001d", "#009bbd"); //d3.interpolateOranges;
      break;
    default:
      colorInterpolator = d3.interpolateRgb("#f9f1ed", "#c94300"); // d3.interpolateOranges;
  }

  const colorScale = d3
    .scaleSequential(colorInterpolator)
    .domain(getMinMax(geodata.features, property));

  return (
    <TooltipProvider delayDuration={150}>
      <div ref={containerRef}>
        <div className={"text-lg font-bold"}>{title}</div>
        <div className={"text-[0.8rem] leading-[1rem] text-zinc-400 pb-2 xs:h-12"}>{subtitle}</div>
        <div className={"pb-2"}>
          <BeeSwarm colorScale={colorScale} filteredData={filteredGeodata.features} data={geodata.features} property={property} activeTooltip={activeTooltip} setTooltip={setTooltip} />
        </div>
        <svg width={dimensions.width} height={dimensions.height} strokeLinecap="round" shapeRendering={"geometricPrecision"}>
          {filteredGeodata.features.map((shape) => (
            <Tooltip
              key={shape.id}
              open={activeTooltip === shape.id}
              onOpenChange={() => setTooltip(shape.id)}
            >
              <TooltipTrigger
                asChild
                onPointerOut={() => setTooltip("")}
                onClick={() => setTooltip(shape.id)}
              >
                <path
                  d={geoPathGenerator(shape) || undefined}
                  stroke="none"
                  strokeWidth={activeTooltip === shape.id ? 2.5 : 0.5}
                  strokeLinecap="round"
                  fill={
                    shape.properties
                      ? colorScale(shape.properties[property])
                      : undefined
                  }
                />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  avoidCollisions
                  collisionBoundary={boundary.current}
                >
                  <div>
                    <p>
                      {shape.properties?.nazobec}
                    </p>
                  </div>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          ))}
          {filteredGeodata.features.map((shape) => (
            <path
              key={`stroke-${shape.id}`}
              d={geoPathGenerator(shape) || undefined}
              stroke={"black"}
              strokeWidth={activeTooltip === shape.id ? 3 : 0.5}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </svg>
      </div>
    </TooltipProvider>
  );
}

export default Map;
