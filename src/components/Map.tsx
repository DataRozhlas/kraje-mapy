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

import orps from "../assets/orps.json";
import topoData_ from "../assets/orp-enhanced.topo.json";

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
    case "ZNEV":
      title = "Socioekonomické znevýhodnění";
      suffix = " (index)";
      break;
    case "CHUD":
      title = "Destabilizující chudoba";
      suffix = " (index)";
      break;
    case "KOALICE":
      title = "Výsledek dnešní opozice";
      suffix = " % hlasů";
      break;
    case "OPOZICE":
      title = "Výsledek pětikoalice";
      suffix = " % hlasů";
      break;
    default:
      title = "Nevím";
  };

  let subtitle;
  switch (property) {
    case "ZNEV":
      subtitle = "Projevuje se nižším vzděláním (málo lidí s maturitou) a nezaměstnaností";
      break;
    case "CHUD":
      subtitle = "Projevuje se exekucemi, bytovou nouzí rodin a životem v sociálně vyloučeném prostředí";
      break;
    case "KOALICE":
      subtitle = "Hlasy pro ANO, ČSSD, KSČM a SPD v minulých krajských volbách 2020";
      break;
    case "OPOZICE":
      subtitle = "Hlasy pro ODS, Piráty, STAN, KDU-ČSL, TOP 09 a regionální partnery v krajských volbách 2020";
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
          (item) => item.properties?.kraj_id === kraj,
        ),
      } as FeatureCollection);

  const projection = d3.geoMercator();
  const geoPathGenerator = d3.geoPath().projection(projection);

  projection.fitSize([dimensions.width, dimensions.height], filteredGeodata);

  // Create a color scale
  let colorInterpolator;
  switch (property) {
    case "ZNEV":
      colorInterpolator = d3.interpolateRgb("#fefff0", "#fa5f11"); //d3.interpolateOranges;
      break;
    case "CHUD":
      colorInterpolator = d3.interpolateRgb("#fffdf0  ", "#e6001d"); //d3.interpolateReds;
      break;
    case "KOALICE":
      colorInterpolator = d3.interpolateRgb("#fffdf0", "#009bbd"); //d3.interpolatePurples;
      break;
    case "OPOZICE":
      colorInterpolator = d3.interpolateRgb("#fffbf0", "#973bc6"); //d3.interpolateBlues;
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
          <BeeSwarm orps={orps} colorScale={colorScale} filteredData={filteredGeodata.features} data={geodata.features} property={property} activeTooltip={activeTooltip} setTooltip={setTooltip} />
        </div>
        <svg width={dimensions.width} height={dimensions.height} strokeLinecap="round">
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
                      {shape.properties
                        ? `${orps.find((orp) => orp.id === Number(shape.id))?.name}: ${shape.properties[property].toLocaleString("cs")} ${suffix}`
                        : "No data"}
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
