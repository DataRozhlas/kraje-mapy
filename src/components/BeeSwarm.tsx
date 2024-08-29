import { useEffect, useRef } from 'react';
import * as d3 from 'd3';




function BeeSwarm({ labels, data, filteredData, property }: { labels: string[], data: any[], filteredData: any[], property: string }) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    function drawPlot() {
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
            .range([5, width - 5]);

        // Draw circles for each data item
        svg.selectAll('circle')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.properties[property]))
            .attr('cy', 10)
            .attr('r', 5)
            .attr('fill', 'blue');
    }

    useEffect(() => {

        drawPlot();
        window.addEventListener("resize", drawPlot);
        return () => window.removeEventListener("resize", drawPlot);


    }, [filteredData, property]);

    console.log(data);

    return (
        <div className={"xs:mr-4"}>
            <div className={"flex justify-between"}>
                <div className={"text-xs"}>{labels[0]}</div>
                <div className={"text-xs"}>{labels[1]}</div>
            </div>
            <svg ref={svgRef} width="100%" height="20"></svg>
        </div>
    );
}

export default BeeSwarm;