import { SvgComponent } from "./component.js";
import { GraphDims } from "../../assets/assets.js";


export class BaseBarGraph extends SvgComponent {
    constructor({model = null,
                 x = 0,
                 y = 0,
                 width = 0,
                 height = 0,
                 data = {}}) {
        super({model: model});
        this.data = data;

        // individual elements for the bar graph
        
        this.bars = null;
        this.axes = null;

        // --- axes ----------
        
        this.yAxis = null;
        this.yAxisLine = null;
        this.yAxisLabel = null;
        this.yAxisScale = null;

        this.xAxis = null;
        this.xAxisLine = null;
        this.xAxisTicks = null;
        this.xAxisLabel = null;
        // -------------------
    }

    // drawUpperGraphStackedBars(element, groups, transform, onClick, mult): Draws the stacked bars for the graph
    drawUpperGraphStackedBars(element, groups, transform, onClick, mult) {
        const groupEntries = Object.entries(groups);
        //  sort the [food group, intake] pairs in decreasing order by intake
        groupEntries.sort((a, b) => b[1]- a[1]);
        let accumulatedHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop;

        groupEntries.forEach((d, i) => this.hoverTooltip(d, mult * 100 + i));

        element.append("g")
            .attr("transform", transform)
            .selectAll("rect")
            .data(groupEntries)
            .enter()
            .append("rect")
                .attr("width", 100)                                     
                .attr("height", (d, i) => 
                    GraphDims.upperGraphHeight - this.upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]) + 
                    /* So that there arent gaps between bars due to rounding */
                    (i !== groupEntries.length - 1 ? 1 : 0)
                )
                .attr("x", -50)
                .attr("y", (d, i) => {
                    const scaledHeight = GraphDims.upperGraphHeight - this.upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]);
                    accumulatedHeight -= scaledHeight;
                    return (accumulatedHeight) - 
                        /* So that there arent gaps between bars due to rounding */
                        (i !== groupEntries.length - 1 ? 1 : 0);
                })
                .attr("fill", d => GraphColours[d[0]]);
        
        accumulatedHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop;
        
        /* Since tool tips cover the bars, use another transparent layer on top of everything with the shape of the bars to detect hover positions */
        this.upperGraphBarHoverDetect.append("g")
            .attr("transform", transform)
            .selectAll("rect")
            .data(groupEntries)
            .enter()
            .append("rect")
                .attr("width", 100)                                     
                .attr("height", (d, i) => 
                    GraphDims.upperGraphHeight - this.upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]) + 
                    /* So that there arent gaps between bars due to rounding */
                    (i !== groupEntries.length - 1 ? 1 : 0)
                )
                .attr("x", -50)
                .attr("y", (d, i) => {
                    const scaledHeight = GraphDims.upperGraphHeight - this.upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]);
                    accumulatedHeight -= scaledHeight;
                    return (accumulatedHeight) - 
                        /* So that there arent gaps between bars due to rounding */
                        (i !== groupEntries.length - 1 ? 1 : 0);
                })
                .attr("fill-opacity", 0)
                .on("mouseover", (d, i) => this.onBarHover(d, mult * 100 + i))
                .on("mousemove", (d, i) => this.onBarHover(d, mult * 100 + i))
                .on("mouseenter", (d, i) => this.onBarHover(d, mult * 100 + i))
                .on("mouseleave", (d, i) => this.onBarUnHover(d, mult * 100 + i))
                .on("click", onClick);
    }

    setup(opts = {}) {
        super.setup(opts);
        this.bars = this.parent.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`)
    
        this.axes = this.parent.append("g");
    
        this.xAxis = axes.append("g")
        this.xAxisLine = this.xAxis.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop + GraphDims.upperGraphHeight})`);
            
        this.xAxisScale = d3.scaleBand()
            .range([0, GraphDims.upperGraphWidth])
        this.xAxisLabel = this.xAxis.append("text")

        this.yAxis = this.axes.append("g")
        this.yAxisLine = this.yAxis.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop})`);
    
        this.yAxisLabel = this.yAxis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("y", GraphDims.upperGraphLeft / 4)
            .attr("x", -(GraphDims.upperGraphTop + GraphDims.upperGraphHeight / 2));
            
        this.yAxisScale = d3.scaleLinear()
            .range([GraphDims.upperGraphHeight, 0]);
    }
}
