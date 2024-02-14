//////////////////////////////////////////////////////////////////////////
//                                                                      //
// Purpose: Handles the display for the sunburst and all its related    //
//      visuals                                                         //
//                                                                      //
// What it Contains:                                                    //
//      - drawing the sunburst                                          //
//      - drawing the table for the sun burst                           //
//      - drawing the legend for the sun burst                          //
//      - drawing the info box for the sunburst                         //
//      - drawing the tool tip for the sunburst                         //
//                                                                      //
//////////////////////////////////////////////////////////////////////////



import { GraphColours, GraphDims, TextAnchor, FontWeight, TextWrap, NutrientDataColNames, SunBurstStates, Colours, TranslationTools } from "../assets/assets.js";
import { Visuals } from "./visuals.js";


export class SunBurst {
    constructor({model = null} = {}) {
        this.model = model;

        // === Data retrieves from the model ===
        this.nutrient = ""
        this.data = null;
        this.foodGroupDescriptions = [];

        this.getUpdatedModelData();

        // =====================================

        this.selectedNode = null;
        this.root = null;
        this.treeHeight = null;
        this.radius = null;
        this.centerOuterRadius = null;
        this.radiusDiffFromCenterArc = null;

        // state of the display for the sunburst graph
        this.graphState = SunBurstStates.AllDisplayed;

        this.mouseOverFoodGroupName = null;
        
        // === individual components within the sunBurst ===

        this.sunBurstGroup = null;
        this.nutrientTextBox = null;
        this.lowerGraphFilterGroupsButton = null;
        this.lowerGraphSunburst = null;
        this.lowerGraphInfoBox = null;
        this.label = null;

        // invisible arcs used to identify mouse hover events
        this.hoverPath = null;

        // the path for the text labels of the graph to follow        
        this.path = null;

        // generator for the display of the arcs on the graph
        this.arc = null;

        // all the hover tooltips for the graph
        this.hoverToolTips = {};

        // =================================================
    }

    draw() {
        return this.lowerGraph(this.data, this.foodGroupDescriptions);
    }

    // getToolTipId(num): Retrieves the key id for a particular id
    getToolTipId(num) {
        return `arcHover${num}`
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
        } else if (this.graphState == SunBurstStates.FilterOnlyLevel2) {
            radius = GraphDims.lowerGraph2LevelFilterArcRadius;
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

    // updateArcThickness(): Updates the thickness for the arcs based on what state the sunburst is in
    updateArcThickness() {
        // update the outer-radius for the arc generators
        this.arc.outerRadius(d => this.getArcOuterRadius(d));

        // Update the radius for the arcs
        this.path.attr("d", (d) => { this.arc(d.current); }); 
        this.hoverPath.attr("d", (d) =>{ this.arc(d.current); });

        // center the position of the arc text labels
        this.label.each((d, i) => {
            const element = d3.select(`#arcLabel${i}`);
            const parent = d3.select(element.node().parentNode);
            parent.attr("dy", (parentNode) => { return this.getLabelDY(parentNode); });
        });
    }

    // getLabelDY(treeNode): Retrieves the y positioning of the label text on the arc
    getLabelDY(treeNode) {
        let radius = this.getRadius(treeNode);
        if (this.graphState == SunBurstStates.FilterOnlyLevel2) {
            radius += (GraphDims.lowerGraph2LevelFilterArcRadius - GraphDims.lowerGraphArcRadius) * 2;
        }

        if (treeNode.depth > 1) {
            return radius / 2;
        }

        return (this.radius - GraphDims.lowerGraphCenterArcRadius) / 2 + 5;
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
        return Visuals.getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize);
    }

    // getArcLabel(index): Retrieves the element for the label of the arc
    getArcLabel(index) {
        return d3.select(`#arcLabel${index}`);
    }

    /* Truncates the label based on the arc's width, replaces letters with ellipsis if too long */
    labelTextFit(d, i){
        const midRadius = this.getArcMiddleRadius(d);
        const element = this.getArcLabel(i);
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
        if ((d.x1 - d.x0) < 2 * Math.PI && !textTruncated) {
            textX = (d.x1 - d.x0) / 2.0 * midRadius - Visuals.getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize) / 2.0;
        }

        if (textX < 0) {
            textX = 0;
        }

        if (availableLength > 0) {
            //console.log("NAME: ", d.data.name, " AND TEXT: ", element.text(), "AVAILA: ", availableLength, "CURRENT LEN: ", this.getArcTextLength(elementNode, text), " Y0: ", d.y0, " AND Y1: ", d.y1, " AND TEXT X: ", textX, " AND TRUNCATED: ", textTruncated);
            //console.log("MID: ", (d.x1 - d.x0) / 2.0, " AND ", Visuals.getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize) / 2.0, " AND ", (d.x1 - d.x0) / 2.0 * midRadius - Visuals.getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize) / 2.0);
        }

        element.attr("startOffset", GraphDims.lowerGraphArcPadding + textX);
    }

    /* Shows label only when the arc has an angle over 0.05 */
    labelVisible(d) {
        return d.x1 - d.x0 > 0.05
    }

    /* Positions tool tip according to arc position */
    positionHoverCard(toolTip, d){
        const relativeAngle = (d.x1 + d.x0)/2 + 3 * Math.PI / 2;

        const x = GraphDims.lowerGraphArcRadius * Math.cos(relativeAngle) * (d.depth + 1);
        const y = GraphDims.lowerGraphArcRadius * Math.sin(relativeAngle) * (d.depth);
        toolTip.group.attr("transform", `translate(${x}, ${y})`);
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
        this.path.each((d,i) => this.positionHoverCard(self.hoverToolTips[self.getToolTipId(i)], d.target))
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
        this.graphState = SunBurstStates.AllDisplayed;
        this.root.each(d => d.target = {
            depth: d.depth,
            data: d.data,
            value: d.value,
            x0: d.x0,
            x1: d.x1,
            y0: d.y0,
            y1: d.y1,
        });

        // enable the on-click event for the arcs
        this.enableArcOnClick();

        // set back the thickness of the arcs back to its original thickness
        this.updateArcThickness();

        this.transitionArcs(1000);
        this.setFilterButtonToLevel2Groups();
    }

    // filterOnLevel2Groups(): Display only level 2 groups of the Sun Burst Graph
    filterOnLevel2Groups(){
        this.graphState = SunBurstStates.FilterOnlyLevel2;
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

        // disable the on-click event for the arcs
        this.disableArcOnClick();

        // increase the thickness of the arcs
        this.updateArcThickness();
        
        this.transitionArcs(1000);
        this.setFilterButtonToAllGroups();
    }

    // arcOnClick(event, i): Handle zoom on click when clicking on an arc.
    arcOnClick(event, i) {
        const children = this.root.descendants();
        this.sunBurstGroup.datum(children[i] ?? this.root);

        // the node that has been clicked
        const p = children[i] ?? children;

        const isTransitionArc = (!p.target || (p.target.x1 - p.target.x0) < 2 * Math.PI || this.selectedNode != p);

        /* Transition only if the clicked arc does not already span a full circle or the arc has not been already selected */
        if (isTransitionArc) {
            this.root.each(d => {
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

        this.selectedNode = p;

        if (isTransitionArc) {
            this.transitionArcs();
        }

        // set the correct state for the filter button
        this.setFilterButtonToLevel2Groups();
    }

    // enableArcOnClick(): Register the on-click event for the arcs to be clickable
    enableArcOnClick() {
        this.hoverPath.on("click", (e, i) => {
            this.arcOnClick(e,i + 1);
        });
    }

    // disableArcOnClick(): Disables the on-click event for the arcs
    disableArcOnClick() {
        this.hoverPath.on("click", null);
    }

    /* Make the opacity of tooltip 1 */
    arcHover(d, i){
        d3.select(`#arcHover${i}`).attr("opacity", 1);
        this.updateInfoBox(d);
    }

    /* Make the opacity of tooltip 0 */
    arcUnHover(d, i){
        d3.select(`#arcHover${i}`).attr("opacity", 0);
        Visuals.updateInfoBox({infoBox: this.lowerGraphInfoBox, colour: Colours.None, text: ""});
    }

    /* Update food group description box */
    updateInfoBox(d){
        let colour = GraphColours[d.data.row[NutrientDataColNames.foodGroupLv1]];
        colour = colour === undefined ? null : colour;

        let foodGroupName = d.data.name;
        if (this.mouseOverFoodGroupName !== null && this.mouseOverFoodGroupName == foodGroupName) {
            return;
        }

        this.mouseOverFoodGroupName = foodGroupName;

        /* XXX TO FILL XXX
        let desc = "";
        try {
            desc = foodGroupDescriptions[d.data.name][FoodGroupDescDataColNames.description];
        } catch {

        }*/

        if (foodGroupName == "All Items") {
            foodGroupName = "";
        }

        Visuals.updateInfoBox({infoBox: this.lowerGraphInfoBox, colour, text: foodGroupName, width: GraphDims.lowerGraphInfoBoxWidth, 
                               fontSize: GraphDims.lowerGraphInfoBoxFontSize, lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing,
                               padding: GraphDims.lowerGraphInfoBoxPadding});
    }

    // getUpdatedModelData(): Retrieves the updated versions of the data from the model
    getUpdatedModelData() {
        this.nutrient = this.model.nutrient;
        this.data = this.model.foodIngredientData;
        this.foodGroupDescriptions = this.model.foodGroupDescriptionData.data;
    }

    lowerGraph(nutrientsData){
        const self = this;
        const tableData = nutrientsData.dataGroupedByNutrientAndDemoList;

        // register the save image button
        d3.select("#lowerGraphSaveGraph").on("click", () => this.saveAsImage());

        // Specify the chart’s dimensions.
        const width = GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth + GraphDims.lowerGraphRight;
        const height = GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight + GraphDims.lowerGraphBottom;
        const lowerGraphRightXPos = GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth;
        self.radius = GraphDims.lowerGraphArcRadius;
    
        const ageSexSelector = d3.select("#lowerGraphAgeSexSelect");
    
        const lowerGraphSvg = d3.select("#lowerGraph").append("svg")
        .attr("overflow", "visible")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .style("font", "10px sans-serif");

        // draw the infobox
        this.lowerGraphInfoBox = Visuals.drawInfoBox({parent: lowerGraphSvg, 
                                                      x: lowerGraphRightXPos,
                                                      y: GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight - GraphDims.lowerGraphInfoBoxHeight,
                                                      height: GraphDims.lowerGraphInfoBoxHeight,
                                                      width: GraphDims.lowerGraphInfoBoxWidth,
                                                      fontSize: GraphDims.lowerGraphInfoBoxFontSize,
                                                      borderWidth: GraphDims.lowerGraphInfoBoxBorderWidth,
                                                      padding: GraphDims.lowerGraphInfoBoxPadding,
                                                      lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing});

        // draw the legend
        Visuals.drawLegend({parent: lowerGraphSvg, 
                            x: lowerGraphRightXPos,
                            y: GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight / 2 - GraphDims.lowerGraphArcRadius * 4 - (GraphDims.lowerGraphArcRadius - GraphDims.lowerGraphCenterArcRadius),
                            data: Object.entries(GraphColours), 
                            legendItemPadding: [0, 2], 
                            textPadding: [5, 0], 
                            colourBoxWidth: GraphDims.legendSquareSize, 
                            colourBoxHeight: GraphDims.legendSquareSize,
                            fontSize: 12});

        const lowerGraphChartHeading = lowerGraphSvg.append("g")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", GraphDims.lowerGraphChartHeadingFontSize)
        .attr("x", width / 2)
        .attr("y", GraphDims.lowerGraphTop - GraphDims.lowerGraphChartHeadingFontSize * 0.75);
    
        self.lowerGraphSunburst = lowerGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth / 2}, ${GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight / 2})`)
    
        self.lowerGraphFilterGroupsButton = d3.select("#lowerGraphFilterGroupsButton");
    
        const lowerGraphTable = d3.select("#lowerGraphTable");
        const lowerGraphTableHeading = lowerGraphTable.append("thead");
        const lowerGraphTableBody = lowerGraphTable.append("tbody");
        const lowerGraphTableTitle = d3.select("#lowerGraphTableTitle");
    
        /* Draws table, sunburst, and updates age-sex selector */
        async function drawGraph(){
            self.getUpdatedModelData();

            ageSexSelector.on("change", () => drawGraph(self.nutrient))
                .selectAll("option")
                .data(nutrientsData.ageSexGroupHeadings)
                .enter()
                .append("option")
                    .property("value", d => d)
                    .text(d => d);
        
            const ageSexGroup = Visuals.getSelector("#lowerGraphAgeSexSelect");
            lowerGraphChartHeading.text(TranslationTools.translateText("lowerGraph.graphTitle", {
                nutrient: self.nutrient,
                ageSexGroup: ageSexGroup
            }))
            .attr("font-weight", FontWeight.Bold);
        
            drawSunburst(self.nutrient, ageSexGroup);
            drawTable(self.nutrient, ageSexGroup);
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
                .attr("dy", d => self.getLabelDY(d))
                .attr("font-size", GraphDims.lowerGraphArcLabelFontSize)
                .attr("fill-opacity", d => +self.labelVisible(d.current))
                    .append("textPath") // make the text following the shape of the arc
                    .attr("id", (d, i) => `arcLabel${i}`)
                    .attr("href", (d, i) => `#arcPath${i}`);
        
            self.label.each((d, i) => self.labelTextFit(d, i));

            // add the nutrient title in the middle of the sunburst
            if (self.nutrientTextBox === null) {
                self.nutrientTextBox = self.lowerGraphSunburst.append("text")
            }

            self.nutrientTextBox.attr("font-weight", FontWeight.Bold)
                .attr("font-size", GraphDims.lowerGraphCenterFontSize)
                .attr("text-anchor", TextAnchor.Middle);
            
            Visuals.drawWrappedText({textGroup: self.nutrientTextBox, text: nutrient, width: GraphDims.centerOuterRadius, 
                                     textY: -GraphDims.lowerGraphCenterArcRadius, fontSize: GraphDims.lowerGraphCenterFontSize});
        
            // TODO: check what this does, copied from the reference 
            self.sunBurstGroup = self.lowerGraphSunburst.append("circle")
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
                .style("cursor", "pointer");
        
            self.hoverPath.on("mousemove", (data, index) => { self.arcHover(data, index) });
            self.hoverPath.on("mouseenter", (data, index) => { self.arcHover(data, index) });
            self.hoverPath.on("mouseover", (data, index) => { self.arcHover(data, index) });
            self.hoverPath.on("mouseout", (data, index) => { self.arcUnHover(data, index) });
            
            if (self.graphState == SunBurstStates.AllDisplayed) {
                self.filterAllFoodGroups();
            } else {
                self.filterOnLevel2Groups();
            }
        
            /* Creation of tooltip */
            function hoverCard(d, root, i, nutrient){
                let width = GraphDims.lowerGraphTooltipMinWidth;
                const arcColour = d3.select(`#arcPath${i}`).attr("fill");

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

                const toolTipId = self.getToolTipId(i);
                const toolTip = Visuals.drawToolTip({parent: root,
                                                     id: toolTipId,
                                                     height: 50, 
                                                     width: width, 
                                                     text: lines, 
                                                     padding: [5, 2],
                                                     borderColour: arcColour,
                                                     borderWidth: 3, 
                                                     textWrap: TextWrap.NoWrap,
                                                     fontSize: GraphDims.lowerGraphTooltipFontSize,
                                                     opacity: 0,
                                                     backgroundColour: Colours.White});

                self.hoverToolTips[toolTipId] = toolTip;

                self.positionHoverCard(toolTip, d);
            }
        }
    
        function drawTable(nutrient, ageSexGroup){
        const nutrientTableData = tableData[nutrient][ageSexGroup];
        /** TODO: Create the lower graph table here **/
        }
    
        /* Return function defined above that updates the graph */
        return drawGraph;
    }

    // saveAsImage(): Saves the bar graph as an image
    saveAsImage() {
        const svg = document.getElementById("lowerGraph").firstChild;
        saveSvgAsPng(svg, "SunburstGraph.png", {backgroundColor: "white"});
    }
}