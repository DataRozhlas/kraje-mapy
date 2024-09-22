import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Define a custom locale with a space before the percentage symbol
const customLocale = d3.formatLocale({
    decimal: ",",
    thousands: " ",
    grouping: [3],
    currency: ["Kč", ""],
    percent: " p. b."
});

const f = customLocale.format("+.0%");

function BeeSwarm({ colorScale, data, filteredData, property, activeTooltip, setTooltip }:
    { colorScale: any, data: any[], filteredData: any[], property: string, activeTooltip: string, setTooltip: Function }) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    function getLabels(property: string) {
        switch (property) {
            case "ur":
                const values = data.map(d => d.properties[property]);
                return [f(d3.min(values) / 100), f(d3.max(values) / 100)];
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

        const circles = svg.selectAll('circle')
            .data(filteredData.sort((a, b) => a.properties[property] - b.properties[property]), (d: any) => d.id);


        // Draw circles for each data item
        circles.enter()
            .append('circle')
            .attr('cx', d => xScale(d.properties[property]))
            .attr('cy', 10)
            .attr('r', 5)
            .attr('fill', d => colorScale(d.properties[property]))
            .attr('stroke', 'black')
            .attr('stroke-width', 0.75)
            .on('pointerover', d => setTooltip(d.target.__data__.id))
            .on('pointerout', () => setTooltip(''))
            .on('click', d => setTooltip(d.target.__data__.id))
            .transition(
                d3.transition()
                    .duration(500)
                    .ease(d3.easeCubic)
            )
            .attr('r', (d: any) => d.id === activeTooltip ? 10 : activeTooltip.length > 0 ? 3 : 5)
            .attr('stroke-width', (d: any) => d.id === activeTooltip ? 1.5 : 0.75);


        // Remove old circles
        //circles.exit().remove();



        // sign for kraj
        if (krajAverage !== undefined) {
            const xKrajAvg = xScale(krajAverage);
            svg.append('text')
                .attr('x', xKrajAvg)
                .attr('y', -4)
                .text("▼")
                .attr('text-anchor', 'middle')
                .attr('font-size', '0.75rem')
                .attr('fill', 'black');

        }


        // sign for country
        if (countryAverage !== undefined) {
            const xCountryAvg = xScale(countryAverage);
            svg.append('text')
                .attr('x', xCountryAvg)
                .attr('y', -4)
                .text("▼")
                .attr('text-anchor', 'middle')
                .attr('font-size', '0.75rem')
                .attr('fill', '#a1a1aa');

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
            .text(d => d.nazobec)
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


    }, [filteredData, property, activeTooltip]);


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