import { useEffect, useRef } from 'react';
import * as d3 from 'd3';


function BeeSwarm({ orps, colorScale, data, filteredData, property, activeTooltip, setTooltip }:
    { orps: any[], colorScale: any, data: any[], filteredData: any[], property: string, activeTooltip: string, setTooltip: Function }) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    function getLabels(property: string) {
        switch (property) {
            case "ZNEV":
                return ["lepší", "horší"];
            case "CHUD":
                return ["lepší", "horší"];
            case "KOALICE":
                return ["méně", "více"];
            case "OPOZICE":
                return ["méně", "více"];
            default:
                return ["", ""];
        }
    }

    function drawPlot() {
        const krajAverage = d3.mean(filteredData, d => d.properties[property]);

        const countryAverage = d3.mean(data, d => d.properties[property]);

        const svg = d3.select(svgRef.current);
        const width = svg.node()?.getBoundingClientRect().width || 0;

        // Clear previous content
        svg.selectAll('*').remove();

        // Draw the horizontal line
        svg.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', 10)
            .attr('y2', 10)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.25);

        // Create a scale to map data values to positions along the line
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.properties[property]) as [number, number])
            .range([9, width - 9]);

        // Draw circles for each data item
        svg.selectAll('circle')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.properties[property]))
            .attr('cy', 10)
            .attr('r', d => d.id === activeTooltip ? 8 : 5)
            .attr('fill', d => colorScale(d.properties[property]))
            .attr('stroke', 'black')
            .attr('stroke-width', 0.75)
            .on('pointerover', d => setTooltip(d.target.__data__.id))
            .on('pointerout', () => setTooltip(''))
            .on('click', d => setTooltip(d.target.__data__.id));

        // Draw vertical line for kraj average
        svg.append('line')
            .attr('x1', krajAverage !== undefined ? xScale(krajAverage) : 0)
            .attr('x2', krajAverage !== undefined ? xScale(krajAverage) : 0)
            .attr('y1', 0)
            .attr('y2', 20)
            .attr('stroke', 'black')
            .attr('stroke-width', 1.2);

        // Draw "X" for country average
        if (countryAverage !== undefined) {
            const xCountryAvg = xScale(countryAverage);
            svg.append('line')
                .attr('x1', xCountryAvg - 7)
                .attr('x2', xCountryAvg + 7)
                .attr('y1', 3)
                .attr('y2', 17)
                .attr('stroke', 'black')
                .attr('stroke-width', 1.2);

            svg.append('line')
                .attr('x1', xCountryAvg + 7)
                .attr('x2', xCountryAvg - 7)
                .attr('y1', 3)
                .attr('y2', 17)
                .attr('stroke', 'black')
                .attr('stroke-width', 1.2);
        }



        svg.selectAll('text')
            .data(filteredData)
            .enter()
            .append('text')
            .attr('x', d => xScale(d.properties[property]))
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '0.75rem')
            .attr('fill', d => d.id === activeTooltip ? 'black' : 'none')
            .text(d => {
                const orp = orps.find(orp => orp.id === Number(d.id))
                return orp ? orp.name : ""
            })
            .each(function (d) {
                const text = d3.select(this);
                const textWidth = text.node()?.getBBox().width || 0;
                const xPos = xScale(d.properties[property]);
                if (xPos + textWidth / 2 > width) {
                    text.attr('text-anchor', 'end');
                    //text.attr('x', width - textWidth / 2);
                } else if (xPos - textWidth / 2 < 0) {
                    text.attr('text-anchor', 'start');
                    //text.attr('x', textWidth / 2);
                }
            });


    }

    useEffect(() => {

        drawPlot();
        window.addEventListener("resize", drawPlot);
        return () => window.removeEventListener("resize", drawPlot);


    }, [filteredData, property]);


    return (
        <div className={"xs:mr-4"}>
            <div className={"flex justify-between"}>
                <div className={"text-xs"}>{getLabels(property)[0]}</div>
                <div className={"text-xs"}>{getLabels(property)[1]}</div>
            </div>
            <svg ref={svgRef} width="100%" height="35" style={{ overflow: 'visible' }}></svg>
        </div>
    );
}

export default BeeSwarm;