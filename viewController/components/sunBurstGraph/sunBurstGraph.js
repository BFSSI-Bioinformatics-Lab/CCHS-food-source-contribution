import { GraphColours } from "../../../assets/colours/graphColours.js";
import { GraphDims } from "../../../assets/dimensions/graphDimensions.js";
import { FoodGroupDescDataColNames, NutrientDataColNames } from "../../../assets/strings/columnNames.js";
import { viewTools } from "../../tools/viewTools.js";
import { Infobox } from "../infobox/infobox.js";
import { Component } from "../component.js";
import { TranslationTools } from "../../../tools/translationTools.js";


export class sunBurst extends Component {
    constructor(data, foodGroupDescriptions, tableData) {
        super();
        this.data = data;
        this.foodGroupDescriptions = foodGroupDescriptions;
        this.tableData = tableData;

        this.selectedNode = null;
        this.root = null;
        this.treeHeight = null;
        this.radius = null;
        this.centerOuterRadius = null;
        this.radiusDiffFromCenterArc = null;
        
        // individual components within the sunBurst
        this.lowerGraphFilterGroupsButton = null;
        this.lowerGraphSunburst = null;
        this.label = null;
        this.hoverPath = null;
        this.path = null;
        this.arc = null;
    }

    draw() {
        return this.lowerGraph(this.data, this.foodGroupDescriptions, this.tableData);
    }

    // getArcColour(treeNode): if a particular tree node in the data does not have a colour, 
    //  retrieves the colour of the most recent ancestor to the current node
    getArcColour(treeNode) {
        let foundColour;

        while(foundColour === undefined && treeNode.depth > 1) {
            foundColour = GraphColours[treeNode.data.name];
            treeNode = treeNode.parent;
        }

        if (foundColour === undefined) {
            foundColour = GraphColours["All Items"];
        }

        return foundColour;
    }


    // getRadius(treeNode): Retrieves the dimensions for the radius
    //  of the arc of a particular tree node
    getRadius(treeNode) {
        let radius = this.radius;
        if (treeNode.depth <= 1) {
            radius = GraphDims.lowerGraphCenterArcRadius;
        }
        
        return radius;
    }

    computeArcOuterRadius(treeNode, radius) {
        return Math.max(treeNode.y0 * radius, treeNode.y1 * radius - 1);
    }

    computeArcInnerRadius(treeNode, radius) {
        return treeNode.y0 * radius;
    }

    // getArcOuterRadius(treeNode): Retrieves the dimensions for the outer radius
    //  of the arc of a particular tree node
    getArcOuterRadius(treeNode) {
        const radius = this.getRadius(treeNode);
        let result = this.computeArcOuterRadius(treeNode, radius);

        if (treeNode.depth <= 1) {
            this.centerOuterRadius = result;
        } else {
            result -= this.radiusDiffFromCenterArc;
        }

        return result;
    }

    // getArcInnerRadius(treeNode): Retrives the dimensions for the inner radius
    //  of the arc of a particular tree node
    getArcInnerRadius(treeNode) {
        const radius = this.radius;
        let result = treeNode.y0 * radius;
        let beforeResult = result;

        if (treeNode.depth == 2 && this.radiusDiffFromCenterArc === null) {
            this.radiusDiffFromCenterArc = result - this.centerOuterRadius - GraphDims.lowerGraphCenterArcMargin;
        }

        if (treeNode.depth > 1) {
            result -= this.radiusDiffFromCenterArc;
        }

        return result;
    }

    // getArcMiddleRadius(treeNode): Retrives the dimensions for the middle radius
    //   of the arc of a particular tree node
    getArcMiddleRadius(treeNode) {
        const outerRadius = this.getArcOuterRadius(treeNode);
        const innerRadius = this.getArcInnerRadius(treeNode);

        return innerRadius + (outerRadius - innerRadius) / 2;
    }

    // setFilterButton(translationKey, onClickAction): Changes the state of the filter button
    //  based on 'translationKey' and 'onClickAction'
    setFilterButton(translationKey, onClickAction) {
        this.lowerGraphFilterGroupsButton.text(TranslationTools.translateText(translationKey));
        this.lowerGraphFilterGroupsButton.on("click", onClickAction);
    }

    setFilterButtonToLevel2Groups() {
        return this.setFilterButton("lowerGraph.seeLevel2Groups", () => this.filterOnLevel2Groups());
    }

    setFilterButtonToAllGroups() {
        return this.setFilterButton("lowerGraph.seeAllGroups", () => this.filterAllFoodGroups());
    }

    /* Shows arc only when the arc has a depth between 1-4 and a nonzero angle */
    arcVisible(d) {
        return d.depth <= this.treeHeight && d.depth >= 1 && d.x1 > d.x0;
    }

    // labelAvailableLength(d): Retrieves the length of available space in a particular arc 'd'
    labelAvailableLength(d, midRadius, ){
        const angle = d.x1 - d.x0;
        const arcLength = midRadius * angle - 2 * GraphDims.lowerGraphArcPadding;
        return arcLength;
    }

    /* Make label appear in the middle of the arc */
    labelTransform() {
        return `translate(${30},0)`;
    }

    // Add some extra tolerance length to the computed text length due to
    //  the inaccuracy of the getComputedTextLength on different browsers
    getArcTextLength(elementNode, text) {
        return elementNode.getComputedTextLength() + 3.2 * text.length;
    }

    /* Truncates the label based on the arc's width, replaces letters with ellipsis if too long */
    labelTextFit(d, i){
        const midRadius = this.getArcMiddleRadius(d);
        const element = d3.select(`#arcLabel${i}`);
        if (!element.node()) return;
        const elementNode = element.node();
        const availableLength = this.labelAvailableLength(d, midRadius); 
        let text = d.data.name;

        element.attr("startOffset", 0);
        element.text(text);
        let textLength = this.getArcTextLength(elementNode, text);
        let textTruncated = false;

        while (textLength > availableLength && text){
            text = text.slice(0, text.length - 1);
            element.text(`${text}...`);
            textLength = this.getArcTextLength(elementNode, text);
            textTruncated = true;
        }

        if (textLength > availableLength) {
            element.text("");
        }

        // center text only if the text is not truncated
        let textX = 0;
        if ((d.x1 - d.x0) < 2 * Math.PI) {
            textX = (d.x1 - d.x0) / 2 * midRadius - elementNode.getComputedTextLength() / 2;
        }

        if (textX < 0) {
            textX = 0;
        }

        if (availableLength > 0) {
            console.log("NAME: ", d.data.name, " AND TEXT: ", element.text(), "AVAILA: ", availableLength, "CURRENT LEN: ", this.getArcTextLength(elementNode, text), " Y0: ", d.y0, " AND Y1: ", d.y1, " AND TEXT X: ", textX, " AND TRUNCATED: ", textTruncated);
            console.log("MID: ", (d.x1 - d.x0) / 2, " AND ", elementNode.getComputedTextLength() / 2, " AND ", (d.x1 - d.x0) / 2 * midRadius - elementNode.getComputedTextLength() / 2);
        }

        element.attr("startOffset", GraphDims.lowerGraphArcPadding + textX);
    }

    /* Shows label only when the arc has an angle over 0.05 */
    labelVisible(d) {
        return d.x1 - d.x0 > 0.05
    }

    /* Positions tool tip according to arc position */
    positionHoverCard(element, d){
        const relativeAngle = (d.x1 + d.x0)/2 + 3 * Math.PI / 2;
        element.attr("transform", `translate(${GraphDims.lowerGraphArcRadius * Math.cos(relativeAngle) * (d.depth + 1)}, ${GraphDims.lowerGraphArcRadius * Math.sin(relativeAngle) * (d.depth)})`);
    }

    // transitionArcs(duration): Sets the transition animations when the arcs move in the Sun Burst graph
    transitionArcs(duration = 750){
        const self = this
        const t = this.lowerGraphSunburst.transition().duration(duration);
        const s = this.lowerGraphSunburst.transition().duration(duration * 1.5);

        this.label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || self.labelVisible(d.target);
        }).transition(s)
            .attr("fill-opacity", (d) => +this.arcVisible(d.target))
            .attrTween("transform", d => () => this.labelTransform(d.current))
            .attr("fill", d => {
                if (this.selectedNode !== null && this.selectedNode.target.data.name == d.target.data.name) {
                    return "white";
                }

                return "black";
            });

        /* Checks whether an arc is visible / have a width > 0 and makes labels/arcs transparent accordingly */
        this.label.attr("href", (d, i) => this.arcVisible(d.target) ? `#arcPath${i}` : "none" )
            .call((d) => d.attr("fill-opacity", 0))
            .each((d, i) => this.labelTextFit(d.target, i));

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        this.path.each((d,i) => this.positionHoverCard(d3.select(`#arcHover${i}`), d.target))
            .transition(t)
            .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
            })
        .filter(function(d) {
            return +this.getAttribute("fill-opacity") || self.arcVisible(d.target);
        })
            .attr("fill-opacity", d => this.arcVisible(d.target) ? 1 : 0)
            .attr("pointer-events", d => this.arcVisible(d.target) ? "auto" : "none") 
            .attrTween("d", d => () => this.arc(d.current));
            
        this.hoverPath.transition(t)
            .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
            })
            .attrTween("d", d => () => self.arc(d.current))
    }

    // filterAllFoodGroups(): Display all levels of the Sun Burst Graph
    filterAllFoodGroups() {
        this.root.each(d => d.target = {
            depth: d.depth,
            data: d.data,
            value: d.value,
            x0: d.x0,
            x1: d.x1,
            y0: d.y0,
            y1: d.y1,
        });

        this.transitionArcs(0);
        this.setFilterButtonToLevel2Groups();
    }

    // filterOnLevel2Groups(): Display only level 2 groups of the Sun Burst Graph
    filterOnLevel2Groups(){
        const highestDepth = 3;
        let acc = 0;

        /* Sort level 2 arcs by value amount */
        const sortedGroups = this.root.descendants().slice(1).sort((a, b) => d3.descending(a.value, b.value));
        sortedGroups.forEach((d, i) => {
            this.root.descendants().find(r => r.data.name === d.data.name).target = {
                depth: d.depth,
                data: d.data,
                value: d.value,
                x0: d.depth === highestDepth ? acc : 0,
                x1: d.depth === highestDepth ? acc + (d.x1 - d.x0) : 0,
                y0: d.y0,
                y1: d.y1
            }
            acc += d.depth === highestDepth ? (d.x1 - d.x0) : 0;
        });
        this.transitionArcs(0);
        this.setFilterButtonToAllGroups();
    }

    lowerGraph(nutrientsData, foodGroupDescriptions){
        const self = this;
        const data = nutrientsData.fullyNestedDataByFoodGroup;
        const tableData = nutrientsData.dataGroupedByNutrientAndDemoList;

        // Specify the chart’s dimensions.
        const width = GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth + GraphDims.lowerGraphRight;
        const height = GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight + GraphDims.lowerGraphBottom;
        self.radius = GraphDims.lowerGraphArcRadius;
    
        const ageSexSelector = d3.select("#lowerGraphAgeSexSelect");
    
        const lowerGraphSvg = d3.select("#lowerGraph").append("svg")
        .attr("overflow", "visible")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .style("font", "10px sans-serif");
    
        const lowerGraphChartHeading = lowerGraphSvg.append("g")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", GraphDims.lowerGraphChartHeadingFontSize)
        .attr("x", width / 2)
        .attr("y", GraphDims.lowerGraphTop - GraphDims.lowerGraphChartHeadingFontSize * 0.75);
    
        self.lowerGraphSunburst = lowerGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth / 2}, ${GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight / 2})`)
    
        self.lowerGraphFilterGroupsButton = d3.select("#lowerGraphFilterGroupsButton");

        const lowerGraphInfoBox = new Infobox(lowerGraphSvg, GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth, GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight - GraphDims.lowerGraphInfoBoxHeight, 
                                              GraphDims.lowerGraphInfoBoxWidth, GraphDims.lowerGraphInfoBoxHeight, GraphDims.lowerGraphInfoBoxFontSize, GraphDims.lowerGraphInfoBoxBorderWidth,
                                              GraphDims.lowerGraphInfoBoxPaddingLeft, GraphDims.lowerGraphInfoBoxLineSpacing, 
                                              GraphDims.lowerGraphInfoBoxBorderWidth - GraphDims.lowerGraphInfoBoxWidth / 2, GraphDims.lowerGraphInfoBoxBorderWidth);
    
        lowerGraphInfoBox.draw();
    
        const lowerGraphTable = d3.select("#lowerGraphTable");
        const lowerGraphTableHeading = lowerGraphTable.append("thead");
        const lowerGraphTableBody = lowerGraphTable.append("tbody");
        const lowerGraphTableTitle = d3.select("#lowerGraphTableTitle");
    
        /* Draws table, sunburst, and updates age-sex selector */
        async function drawGraph(nutrient){
            ageSexSelector.on("change", () => drawGraph(nutrient))
                .selectAll("option")
                .data(Object.keys(data[nutrient]))
                .enter()
                .append("option")
                    .property("value", d => d)
                    .text(d => d);
        
            const ageSexGroup = viewTools.getSelector("#lowerGraphAgeSexSelect");
            lowerGraphChartHeading.text(TranslationTools.translateText("lowerGraph.graphTitle", {
                nutrient,
                ageSexGroup
            }));
        
            drawSunburst(nutrient, ageSexGroup);
            drawTable(nutrient, ageSexGroup);
        }
    
        // Source reference: https://observablehq.com/@d3/zoomable-sunburst
        function drawSunburst(nutrient, ageSexGroup){
            self.lowerGraphSunburst.selectAll("g").remove();
            const groupedPercentages = nutrientsData.buildSunBurstTree(nutrient, ageSexGroup);
        
            // Compute the layout.
            const hierarchy = d3.hierarchy(groupedPercentages)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            self.treeHeight = hierarchy.height;
        
            self.root = d3.partition()
                .size([2 * Math.PI, hierarchy.height + 1])
                (hierarchy);
        
            self.root.each(d => d.current = d);
        
            // Create the arc generator.
            self.arc = d3.arc()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                .padRadius(self.radius * 1.5)
                .innerRadius(d => self.getArcInnerRadius(d))
                .outerRadius(d => self.getArcOuterRadius(d));
        
            // Append the arcs and pass in the data
            self.path = self.lowerGraphSunburst.append("g")
                .selectAll("path")
                .data(self.root.descendants().slice(1))
                .join("path")
                .attr("fill", d => self.getArcColour(d))
                .attr("fill-opacity", d => self.arcVisible(d.current) ? 1 : 0)
                .property("id", (d, i) => `arcPath${i}`)
                .attr("d", d => self.arc(d.current))
        
            /* Update title of each individual arc, which appears when hovering over label */
            const format = d3.format(",d");
            self.path.append("title")
                .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
            
            /* Name of each arc */
            self.label = self.lowerGraphSunburst.append("g")
                .attr("pointer-events", "none")
                .style("user-select", "none")
                .selectAll("text")
                .data(self.root.descendants().slice(1))
                .join("text")
                .attr("dy", d => self.getRadius(d) / 2)
                .attr("font-size", GraphDims.lowerGraphArcLabelFontSize)
                .attr("fill-opacity", d => +self.labelVisible(d.current))
                    .append("textPath") // make the text following the shape of the arc
                    .attr("id", (d, i) => `arcLabel${i}`)
                    .attr("href", (d, i) => `#arcPath${i}`);
        
            self.label.each((d, i) => self.labelTextFit(d, i));
        
            // TODO: check what this does, copied from the reference 
            const parent = self.lowerGraphSunburst.append("circle")
                .datum(self.root.descendants())
                .attr("r", d => self.getRadius(d))
                .attr("fill", "none")
                .attr("pointer-events", "all");
        
            // filter on level 2 groups on button click
            self.lowerGraphFilterGroupsButton.on("click", self.filterOnLevel2Groups);
        
            const mouseOverBoxes = self.lowerGraphSunburst.append("g");
        
            self.root.descendants().slice(1).forEach((d, i) => hoverCard(d, mouseOverBoxes, i));
        
            /* Create invisible arc paths on top of graph in order to detect hovering */
            self.hoverPath = self.lowerGraphSunburst.append("g")
                .selectAll("path")
                .data(self.root.descendants().slice(1))
                .join("path")
                .attr("fill-opacity", 0)
                .attr("pointer-events", "auto")
                .attr("d", d => self.arc(d.current))
        
            // Make the arcs clickable.
            self.hoverPath.style("cursor", "pointer")
                .on("click", (e, i) => {
                    clicked(e,i + 1);
                });
        
            self.hoverPath.on("mousemove", arcHover);
            self.hoverPath.on("mouseenter", arcHover);
            self.hoverPath.on("mouseover", arcHover);
            self.hoverPath.on("mouseout", arcUnHover);
        
            self.filterAllFoodGroups();
        
            /* Make the opacity of tooltip 1 */
            function arcHover(d, i){
                d3.select(`#arcHover${i}`).attr("opacity", 1);
                updateInfoBox(d);
            }
            /* Make the opacity of tooltip 0 */
            function arcUnHover(d, i){
                d3.select(`#arcHover${i}`).attr("opacity", 0);
            }

            // Handle zoom on click.
            function clicked(event, i) {
        
                const children = self.root.descendants();
                parent.datum(children[i] ?? self.root);

                // the node that has been clicked
                const p = children[i] ?? children;

                const isTransitionArc = (!p.target || (p.target.x1 - p.target.x0) < 2 * Math.PI || self.selectedNode != p);
        
                /* Transition only if the clicked arc does not already span a full circle or the arc has not been already selected */
                if (isTransitionArc) {
                    self.root.each(d => {
                        if (d.data.row)
                            d.target = {
                                depth: d.depth,
                                data: d.data,
                                value: d.value,
                                x0: d.value && d == p || (d.children && d.children.find(r => p == r)) ? 0 : (p.data.row["Food group_level1"] == d.data.row["Food group_level1"] || d.depth == 1 || p.depth == 1) ? Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI : 0,
                                x1: d.value && d == p || (d.children && d.children.find(r => p == r)) ? 2 * Math.PI : (p.data.row["Food group_level1"] == d.data.row["Food group_level1"] || d.depth == 1 || p.depth == 1) ? Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI : 0,
                                y0: d.y0,
                                y1: d.y1
                            }
                    });
                }

                self.selectedNode = p;

                if (isTransitionArc) {
                    self.transitionArcs();
                }

                // set the correct state for the filter button
                self.setFilterButtonToLevel2Groups();
            }
        
            /* Creation of tooltip */
            function hoverCard(d, root, i, nutrient){
                const arcColour = d3.select(`#arcPath${i}`).attr("fill");
                const card = root.append("g")
                    .attr("id", `arcHover${i}`)
                    .attr("fill", arcColour)
                    .attr("opacity", 0);
        
                const cardRect = card.append("rect")
                    .attr("height", 50)
                    .attr("fill", "white")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .attr("stroke", arcColour)
                    .attr("x", 0)
                    .attr("y", 0);
                
                /* Content of tooltip */
                const lines = TranslationTools.translateText("lowerGraph.infoBoxLevel", { 
                    returnObjects: true, 
                    context: d.depth,
                    name: d.data.name,
                    percentage: d.data.row.Percentage,
                    parentGroup: d.depth > 1 ? d.parent.data.name : "",
                    parentPercentage: d.depth > 1 ? Math.round(d.data.row.Percentage / d.parent.data.row.Percentage * 1000) / 10 : 0,
                    nutrient
                });
                
                let width = GraphDims.lowerGraphTooltipMinWidth;
                lines.map((line, lineNum) => {
                    const text = card.append("text")
                        .attr("x", 10)
                        .attr("y", (lineNum + 1) * 10)
                        .text(line);
                    width = Math.max(text.node().getComputedTextLength() + 20, width);
                })
                cardRect.attr("width", width);
        
                self.positionHoverCard(card, d);
            }
        
            /* Update food group description box */
            function updateInfoBox(d){
                let colour = GraphColours[d.data.row[NutrientDataColNames.foodGroupLv1]];

                let desc = "";
                try {
                    desc = foodGroupDescriptions[d.data.name][FoodGroupDescDataColNames.description];
                } catch {

                }

                lowerGraphInfoBox.updateText(desc, colour);
            }
    
        }
    
        function drawTable(nutrient, ageSexGroup){
        const nutrientTableData = tableData[nutrient][ageSexGroup];
        /** TODO: Create the lower graph table here **/
        }
    
        /* Return function defined above that updates the graph */
        return drawGraph;
    }

}