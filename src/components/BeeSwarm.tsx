import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BeeSwarm({ labels }: { labels: string[] }) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
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
            .attr('stroke-width', 0.2);
    }, []);

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