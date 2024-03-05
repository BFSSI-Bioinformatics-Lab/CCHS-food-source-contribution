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
// NOTE:                                                                //
//      - Visualizations in UI code will not be abstracted so that      //
//          the visuals can be copy and pasted                          //
//      - We use nested functions to not get confused with state        //
//          information in class attributes and to not pass in many     //
//          arguments to functions                                      //
//////////////////////////////////////////////////////////////////////////



import { GraphColours, GraphDims, TextAnchor, FontWeight, TextWrap, SunBurstStates, Colours, Translation, FoodIngredientDataColNames } from "./assets.js";
import { getSelector, getTextWidth, drawWrappedText, drawText } from "./visuals.js";


export function lowerGraph(model){
    // nutrient selected
    let nutrient = model.nutrient;

    // state of the display for the sunburst graph
    let graphState = SunBurstStates.AllDisplayed;

    // register the save image button
    d3.select("#lowerGraphSaveGraph").on("click", () => saveAsImage());

    // register the download table button
    const downloadButton = d3.select("#lowerGraphSaveTable").on("click", () => downloadTable());

    // all the hover tooltips for the graph
    const hoverToolTips = {};

    // unit for the nutrient
    let nutrientUnit = "";

    // which arc is selected in the sunburst
    let selectedNodeIndex = 1;
    let selectedNode = null;

    // Specify the chart’s dimensions.
    const width = GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth + GraphDims.lowerGraphRight;
    const height = GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight + GraphDims.lowerGraphBottom;
    const lowerGraphRightXPos = GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth;

    // used for calculating the radius
    let radiusDiffFromCenterArc;
    let centerOuterRadius;

    // textbox for the nutrient at the center of the sun burst
    let nutrientTextBox;

    // the food group that the mouse is over
    let mouseOverFoodGroupName = null;

    const ageSexSelector = d3.select("#lowerGraphAgeSexSelect");

    const lowerGraphSvg = d3.select("#lowerGraph").append("svg")
    .attr("overflow", "visible")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;")
    .style("font", "10px sans-serif");

    // --------------- draws the info box ---------------------
    
    // attributes for the info box
    const infoBox = {};
    let infoBoxHeight = GraphDims.lowerGraphInfoBoxHeight;
    const infoBoxBorderWidth = GraphDims.lowerGraphInfoBoxBorderWidth;
    const infoBoxPadding = GraphDims.lowerGraphInfoBoxPadding;

    const infoBoxTextGroupHeight = Math.max(infoBoxHeight, infoBoxHeight - infoBoxPadding - infoBoxPadding);

    // group for the info box
    infoBox.group = lowerGraphSvg.append("g")
        .attr("transform", `translate(${lowerGraphRightXPos}, ${GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight - GraphDims.lowerGraphInfoBoxHeight})`);

    // border line for the info box
    infoBox.highlight = infoBox.group.append("line")
        .attr("x1", infoBoxBorderWidth / 2)
        .attr("x2", infoBoxBorderWidth / 2)
        .attr("y2", infoBoxHeight)
        .attr("stroke-width", infoBoxBorderWidth)
        .attr("visibility", "visible")
        .attr("stroke-linecap", "round");

    // container to hold the text
    infoBox.textGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.lowerGraphInfoBoxFontSize)
        .attr("transform", `translate(${infoBoxBorderWidth + infoBoxPadding}, ${infoBoxPadding})`);
    
    // draw the text
    const textDims = drawText({textGroup: infoBox.textGroup, fontSize: GraphDims.lowerGraphInfoBoxFontSize, 
                               lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing, paddingLeft: infoBoxPadding, paddingRight: infoBoxPadding});

    // update the height of the info box to be larger than the height of the text
    infoBoxHeight = Math.max(infoBoxTextGroupHeight, textDims.textBottomYPos + infoBoxPadding);
    infoBox.highlight.attr("y2", infoBoxHeight);

    const lowerGraphInfoBox = infoBox;

    // --------------------------------------------------------

    // ----------------- draws the legend ---------------------
    
    // attributes for the legend
    const legendItemPaddingHor = 0;
    const legendItemPaddingVert = 2;
    const legendItemTextPaddingHor = 5;
    const legendItemTextPaddingVert = 0;
    const legendItemFontSize = 12;

    const legendData = Object.entries(GraphColours);
    const colourBoxWidth = GraphDims.legendSquareSize;
    const colourBoxHeight = GraphDims.legendSquareSize;
    const legendItems = [];
    let currentLegendItemYPos = 0;
    
    // draw the container to hold the legend
    const legendGroup = lowerGraphSvg.append("g")
        .attr("transform", `translate(${lowerGraphRightXPos}, ${ GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight / 2 - GraphDims.lowerGraphArcRadius * 4 - (GraphDims.lowerGraphArcRadius - GraphDims.lowerGraphCenterArcRadius)})`);

    // draw all the keys for the legend
    for (const legendKey of legendData) {
        let legendKeyText = Translation.translate(`LegendKeys.${legendKey[0]}`);
        let legendKeyColour = legendKey[1];

        // ***************** draws a key in the legend *********************
        
        const legendItemGroup = legendGroup.append("g")
        .attr("transform", `translate(0, ${currentLegendItemYPos})`);

        // draw the coloured box
        const colourBox = legendItemGroup.append("rect")
            .attr("y", legendItemPaddingVert)
            .attr("x", legendItemPaddingHor)
            .attr("width", colourBoxWidth)
            .attr("height", colourBoxHeight)
            .attr("fill", legendKeyColour);

        // draw the text
        const textX = legendItemPaddingHor + colourBoxWidth + legendItemTextPaddingHor;
        const textY = legendItemTextPaddingVert;
        const textGroup = legendItemGroup.append("text")
            .attr("y", legendItemPaddingVert)
            .attr("x", textX)
            .attr("font-size", legendItemFontSize);

        drawText({textGroup, fontSize: legendItemFontSize, textWrap: TextWrap.NoWrap, text: legendKeyText, textX, textY});

        const legendItem = {group: legendItemGroup, colourBox, textGroup, name: legendKeyText, colour: legendKeyColour};

        // *****************************************************************

        currentLegendItemYPos += legendItemPaddingVert + legendItemPaddingVert + legendItemGroup.node().getBBox()["height"];
        legendItems.push(legendItem);
    }

    // --------------------------------------------------------

    const lowerGraphChartHeading = lowerGraphSvg.append("g")
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", GraphDims.lowerGraphChartHeadingFontSize)
    .attr("x", width / 2)
    .attr("y", GraphDims.lowerGraphTop - GraphDims.lowerGraphChartHeadingFontSize * 0.75);

    const lowerGraphSunburst = lowerGraphSvg.append("g")
    .attr("transform", `translate(${GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth / 2}, ${GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight / 2})`)

    const lowerGraphFilterGroupsButton = d3.select("#lowerGraphFilterGroupsButton");

    const lowerGraphTable = d3.select("#lowerGraphTable");
    const lowerGraphTableTitle = d3.select("#lowerGraphTableTitle");

    // remove any dummy tables that says "no data available in table" produced by JQuery due to a
    //  race condition of D3 adding rows into the scroll table and JQuery setting up the scroll table
    lowerGraphTable.selectAll("thead").remove();
    lowerGraphTable.selectAll("tbody").remove();
    d3.select("#lowerGraphTable_wrapper .dataTables_scroll .dataTables_scrollHead").remove();

    const lowerGraphTableHeading = lowerGraphTable.append("thead");
    const lowerGraphTableBody = lowerGraphTable.append("tbody");

    /* Draws table, sunburst, and updates age-sex selector */
    async function drawGraph(){
        nutrient = model.nutrient;

        ageSexSelector.on("change", () => drawGraph(nutrient))
            .selectAll("option")
            .data(model.ageSexGroupHeadings)
            .enter()
            .append("option")
                .property("value", d => d)
                .text(d => d);
    
        const ageSexGroup = getSelector("#lowerGraphAgeSexSelect");
        lowerGraphChartHeading.text(Translation.translate("lowerGraph.graphTitle", {
            nutrient: nutrient,
            ageSexGroup: ageSexGroup
        }))
        .attr("font-weight", FontWeight.Bold);
    
        drawSunburst(nutrient, ageSexGroup);
    }

    // Source reference: https://observablehq.com/@d3/zoomable-sunburst
    function drawSunburst(nutrient, ageSexGroup){
        // reset the selected arc that was clicked
        selectedNodeIndex = 1;
        selectedNode = null;

        // get the units for the nutrient
        nutrientUnit = model.getNutrientUnit()

        lowerGraphSunburst.selectAll("g").remove();
        const groupedPercentages = model.buildSunBurstTree(nutrient, ageSexGroup);
    
        // Compute the layout.
        const hierarchy = d3.hierarchy(groupedPercentages)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        const treeHeight = hierarchy.height;
    
        const root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1])
            (hierarchy);
    
        root.each(d => d.current = d);
    
        // Create the arc generator.
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(d => getRadius(d) * 1.5)
            .innerRadius(d => getArcInnerRadius(d))
            .outerRadius(d => getArcOuterRadius(d));
    
        // Append the arcs and pass in the data
        const path = lowerGraphSunburst.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => getArcColour(d))
            .attr("fill-opacity", d => arcVisible(d.current) ? 1 : 0)
            .property("id", (d, i) => `arcPath${i}`)
            .attr("d", d => arc(d.current))
    
        /* Update title of each individual arc, which appears when hovering over label */
        const format = d3.format(",d");
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
        
        /* Name of each arc */
        const label = lowerGraphSunburst.append("g")
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", d => getLabelDY(d))
            .attr("font-size", GraphDims.lowerGraphArcLabelFontSize)
            .attr("fill-opacity", d => +labelVisible(d.current))
                .append("textPath") // make the text following the shape of the arc
                .attr("id", (d, i) => `arcLabel${i}`)
                .attr("href", (d, i) => `#arcPath${i}`);
    
        label.each((d, i) => labelTextFit(d, i));

        // add the nutrient title in the middle of the sunburst
        if (nutrientTextBox === undefined) {
            nutrientTextBox = lowerGraphSunburst.append("text")
        }

        nutrientTextBox.attr("font-weight", FontWeight.Bold)
            .attr("font-size", GraphDims.lowerGraphCenterFontSize)
            .attr("text-anchor", TextAnchor.Middle);
        
        drawWrappedText({textGroup: nutrientTextBox, text: nutrient, width: GraphDims.centerOuterRadius, 
                         textY: -GraphDims.lowerGraphCenterArcRadius, fontSize: GraphDims.lowerGraphCenterFontSize});
    
        // TODO: check what this does, copied from the reference 
        const sunBurstGroup = lowerGraphSunburst.append("circle")
            .datum(root.descendants())
            .attr("r", d => getRadius(d))
            .attr("fill", "none")
            .attr("pointer-events", "all");
    
        // filter on level 2 groups on button click
        lowerGraphFilterGroupsButton.on("click", filterOnLevel2Groups);
    
        const mouseOverBoxes = lowerGraphSunburst.append("g");
    
        root.descendants().slice(1).forEach((d, i) => hoverCard(d, mouseOverBoxes, i));
    
        /* Create invisible arc paths on top of graph in order to detect hovering */
        const hoverPath = lowerGraphSunburst.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill-opacity", 0)
            .attr("pointer-events", "auto")
            .attr("d", d => arc(d.current))
            .style("cursor", "pointer");
    
        hoverPath.on("mousemove", (data, index) => { arcHover(data, index) });
        hoverPath.on("mouseenter", (data, index) => { arcHover(data, index) });
        hoverPath.on("mouseover", (data, index) => { arcHover(data, index) });
        hoverPath.on("mouseout", (data, index) => { arcUnHover(data, index) });
        
        if (graphState == SunBurstStates.AllDisplayed) {
            filterAllFoodGroups();
        } else {
            filterOnLevel2Groups();
        }
    
        /* Creation of tooltip */
        function hoverCard(d, root, i, nutrient){
            let width = GraphDims.lowerGraphTooltipMinWidth;
            const arcColour = d3.select(`#arcPath${i}`).attr("fill");

            /* Content of tooltip */
            const lines = Translation.translate("lowerGraph.infoBoxLevel", { 
                returnObjects: true, 
                context: d.depth,
                name: d.data.name,
                percentage: Math.round( d.data.row.Percentage * 10) / 10,
                parentGroup: d.depth > 1 ? d.parent.data.name : "",
                parentPercentage: d.depth > 1 ? Math.round(d.data.row.Percentage / d.parent.data.row.Percentage * 1000) / 10 : 0,
                nutrient
            });

            const toolTipId = `arcHover${i}`;

            // ------- draw the tooltip ------------

            // attributes for the tool tip
            const toolTip = {};
            let toolTipWidth = width;
            let toolTipHeight = 50;
            const toolTipBorderWidth = 3;
            const toolTipBackgroundColor = Colours.White;
            const toolTipPaddingHor = GraphDims.lowerGraphTooltipPaddingHor;
            const toolTipPaddingVert = GraphDims.lowerGraphTooltipPaddingVert;
            const toolTipTextPaddingHor = GraphDims.lowerGraphTooltipTextPaddingHor;
            const toolTipTextPaddingVert = GraphDims.lowerGraphTooltipTextPaddingVert;

            const toolTipTextGroupWidth = Math.max(width, width - toolTipPaddingHor - toolTipPaddingHor);
            const toolTipHighlightXPos = toolTipPaddingHor + toolTipBorderWidth / 2;

            // draw the container for the tooltip
            toolTip.group = root.append("g")
                .attr("id",  toolTipId)
                .attr("opacity", 0);

            // draw the background for the tooltip
            toolTip.background = toolTip.group.append("rect")
                .attr("height", toolTipHeight)
                .attr("width", toolTipWidth)
                .attr("fill", toolTipBackgroundColor)
                .attr("stroke", arcColour)
                .attr("stroke-width", 1)
                .attr("rx", 5);

            // draw the highlight
            toolTip.highlight = toolTip.group.append("line")
                .attr("x1", toolTipHighlightXPos)
                .attr("x2", toolTipHighlightXPos)
                .attr("y1", toolTipPaddingVert)
                .attr("y2", toolTipHeight - toolTipPaddingVert)
                .attr("stroke", arcColour) 
                .attr("stroke-width", toolTipBorderWidth)
                .attr("stroke-linecap", "round");

            // draw the text
            toolTip.textGroup = toolTip.group.append("text")
                .attr("font-size", GraphDims.lowerGraphTooltipFontSize)
                .attr("transform", `translate(${toolTipBorderWidth + toolTipPaddingHor +  toolTipTextPaddingHor}, ${toolTipPaddingVert + toolTipTextPaddingVert})`);

            const textDims = drawText({textGroup: toolTip.textGroup, text: lines, width: toolTipTextGroupWidth, fontSize: GraphDims.lowerGraphTooltipFontSize, 
                                       textWrap: TextWrap.NoWrap, paddingLeft: toolTipPaddingHor, paddingRight: toolTipPaddingHor});

            // update the height of the tooltip to be larger than the height of all the text
            toolTipHeight = Math.max(toolTipHeight, toolTipPaddingVert + toolTipTextPaddingVert + textDims.textBottomYPos + toolTipTextPaddingVert + toolTipPaddingVert);
            toolTip.background.attr("height", toolTipHeight);
            toolTip.highlight.attr("y2", toolTipHeight - toolTipPaddingVert);

            // update the width of the tooltip to be larger than the width of all the text
            toolTipWidth = Math.max(toolTipWidth, toolTipPaddingHor + textDims.width + toolTipPaddingHor);
            toolTip.background.attr("width", toolTipWidth);

            // -------------------------------------

            hoverToolTips[toolTipId] = toolTip;
            positionHoverCard(toolTip, d);
        }

        /* Shows arc only when the arc has a depth between 1-4 and a nonzero angle */
        function arcVisible(d) {
            return d.depth <= treeHeight && d.depth >= 1 && d.x1 > d.x0;
        }

        /* Make the opacity of tooltip 1 */
        function arcHover(d, i){
            d3.select(`#arcHover${i}`).attr("opacity", 1);
            updateInfoBox(d);
        }

        /* Make the opacity of tooltip 0 */
        function arcUnHover(d, i){
            d3.select(`#arcHover${i}`).attr("opacity", 0);
            drawText({textGroup: lowerGraphInfoBox.textGroup});
            lowerGraphInfoBox.highlight.attr("stroke", Colours.None);
        }

        // updateArcThickness(): Updates the thickness for the arcs based on what state the sunburst is in
        function updateArcThickness() {
            // update the outer-radius for the arc generators
            arc.outerRadius(d => getArcOuterRadius(d));

            // Update the radius for the arcs
            path.attr("d", (d) => { arc(d.current); }); 
            hoverPath.attr("d", (d) =>{ arc(d.current); });

            // center the position of the arc text labels
            label.each((d, i) => {
                const element = d3.select(`#arcLabel${i}`);
                const parent = d3.select(element.node().parentNode);
                parent.attr("dy", (parentNode) => { return getLabelDY(parentNode); });
            });
        }

        /* Positions tool tip according to arc position */
        function positionHoverCard(toolTip, d){
            const relativeAngle = (d.x1 + d.x0)/2 + 3 * Math.PI / 2;

            const x = GraphDims.lowerGraphArcRadius * Math.cos(relativeAngle) * (d.depth + 1);
            const y = GraphDims.lowerGraphArcRadius * Math.sin(relativeAngle) * (d.depth);
            toolTip.group.attr("transform", `translate(${x}, ${y})`);
        }

        // transitionArcs(duration): Sets the transition animations when the arcs move in the Sun Burst graph
        function transitionArcs(duration = 750){
            const t = lowerGraphSunburst.transition().duration(duration);
            const s = lowerGraphSunburst.transition().duration(duration * 1.5);

            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(s)
                .attr("fill-opacity", (d) => +arcVisible(d.target))
                .attrTween("transform", d => () => `translate(30,0)`)
                .attr("fill", d => {
                    if (selectedNode !== null && selectedNode.target.data.name == d.target.data.name) {
                        return "white";
                    }

                    return "black";
                });

            /* Checks whether an arc is visible / have a width > 0 and makes labels/arcs transparent accordingly */
            label.attr("href", (d, i) => arcVisible(d.target) ? `#arcPath${i}` : "none" )
                .call((d) => d.attr("fill-opacity", 0))
                .each((d, i) => labelTextFit(d.target, i));

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.each((d,i) => positionHoverCard(hoverToolTips[`arcHover${i}`], d.target))
                .transition(t)
                .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
                })
            .filter(function(d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
                .attr("fill-opacity", d => arcVisible(d.target) ? 1 : 0)
                .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 
                .attrTween("d", d => () => arc(d.current));
                
            hoverPath.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .attrTween("d", d => () => arc(d.current))
        }

        // setFilterButton(translationKey, onClickAction): Changes the state of the filter button
        //  based on 'translationKey' and 'onClickAction'
        function setFilterButton(translationKey, onClickAction) {
            lowerGraphFilterGroupsButton.text(Translation.translate(translationKey));
            lowerGraphFilterGroupsButton.on("click", onClickAction);
        }

        // setFilterButtonToLevel2Groups(): Changes the filter button to be to filter on level 2 groups
        function setFilterButtonToLevel2Groups() {
            setFilterButton("lowerGraph.seeLevel2Groups", () => filterOnLevel2Groups());
        }

        // filterOnLevel2Groups(): Display only level 2 groups of the Sun Burst Graph
        function filterOnLevel2Groups(){
            graphState = SunBurstStates.FilterOnlyLevel2;
            const highestDepth = 3;
            let acc = 0;

            /* Sort level 2 arcs by value amount */
            const sortedGroups = root.descendants().slice(1).sort((a, b) => d3.descending(a.value, b.value));
            sortedGroups.forEach((d, i) => {
                root.descendants().find(r => r.data.name === d.data.name).target = {
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
            hoverPath.on("click", null);

            // increase the thickness of the arcs
            updateArcThickness();
            
            transitionArcs(1000);
            setFilterButton("lowerGraph.seeAllGroups", () => filterAllFoodGroups());

            // update the filter for the table of the sunburst
            drawTable(ageSexGroup);
        }

        // filterAllFoodGroups(): Display all levels of the Sun Burst Graph
        function filterAllFoodGroups() {
            graphState = SunBurstStates.AllDisplayed;
            root.each(d => d.target = {
                depth: d.depth,
                data: d.data,
                value: d.value,
                x0: d.x0,
                x1: d.x1,
                y0: d.y0,
                y1: d.y1,
            });

            // enable the on-click event for the arcs
            hoverPath.on("click", (e, i) => { arcOnClick(e,i + 1); });

            // set back the thickness of the arcs back to its original thickness
            updateArcThickness();

            transitionArcs(1000);
            setFilterButtonToLevel2Groups();

            // get back to the previously clicked arc
            arcOnClick(null, selectedNodeIndex);

            // update the filter for the table of the sunburst
            drawTable(ageSexGroup);
        }

        // arcOnClick(event, i): Handle zoom on click when clicking on an arc.
        function arcOnClick(event, i) {
            const children = root.descendants();
            sunBurstGroup.datum(children[i] ?? root);

            // the node that has been clicked
            const p = children[i] ?? children;

            const isTransitionArc = (!p.target || (p.target.x1 - p.target.x0) < 2 * Math.PI || selectedNode != p);

            /* Transition only if the clicked arc does not already span a full circle or the arc has not been already selected */
            if (isTransitionArc) {
                root.each(d => {
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

            selectedNode = p;
            selectedNodeIndex = i;
            
            // update the table based off the selected arc
            drawTable(ageSexGroup);

            if (isTransitionArc) {
                transitionArcs();
            }

            // set the correct state for the filter button
            setFilterButtonToLevel2Groups();
        }
    }

    /* Return function defined above that updates the graph */
    return drawGraph;


    // draws the table for the sun burst graph
    function drawTable(ageSexGroup){
        const sunBurstNode = selectedNode ?? { depth: 1, data: {name: Translation.translate("LegendKeys.All Items")}} 
        const sunBurstTable = model.createSunburstTable(ageSexGroup, graphState, sunBurstNode.depth, sunBurstNode.data.name);

        // --------------- draws the table -------------------------

        /* Create subheading columns */
        const amountLeftIndex = 3;

        lowerGraphTableHeading.selectAll("tr").remove();
        lowerGraphTableHeading.append("tr")
            .selectAll("td")
            .data(sunBurstTable.headings)
            .enter()
            .append("td")
                .style("min-width", (d, i) => i < amountLeftIndex ? "50px" : "40px")
                .style("border-left", (d, i) => i == amountLeftIndex ? GraphDims.tableSectionBorderLeft : "")
                .style("border-top", "0px")
                .style("font-size", `${GraphDims.lowerGraphTableSubHeadingFontSize}px`)
                .style("font-weight", (d, i) => {
                    const colNum = (i - amountLeftIndex) % 4;
                    if (i >= amountLeftIndex && (colNum === 2 || colNum === 0)) {
                        return FontWeight.Bold;
                    }

                    return FontWeight.Normal;
                })
                .style("opacity", (d, i) => {
                    const colNum = (i - amountLeftIndex) % 4;
                    if (i >= amountLeftIndex && (colNum === 3 || colNum === 1)) {
                        return 0.8;
                    }

                    return 1;
                })
                .attr("colspan", 1)
                .text(d => Translation.translate(d))
        
        lowerGraphTableBody.selectAll("tr").remove();

        for (const row of sunBurstTable.table) {
            const newRow = lowerGraphTableBody.append("tr")
                .selectAll("td")
                .data(row)
                .enter()
                .append("td")
                    .attr("colspan", 1)
                    .text((d) => Number.isNaN(d) ? "" : d)
                    .attr("class", (d, i) => i !== 0 ? "brdr-lft" : "")
                    .style("border-left", (d, i) => i == amountLeftIndex ? GraphDims.tableSectionBorderLeft : "")
                    .style("font-size", "12px")
                    .style("font-weight", (d, i) => {
                        const colNum = (i - amountLeftIndex) % 4;
                        if (i >= amountLeftIndex && (colNum === 2 || colNum === 0)) {
                            return FontWeight.Bold;
                        }

                        return FontWeight.Normal; 
                    })
                    .style("opacity", (d, i) => {
                        const colNum = (i - amountLeftIndex) % 4;
                        if (i >= amountLeftIndex && (colNum === 3 || colNum === 1)) {
                            return 0.8;
                        }

                        return 1;
                    });
        }

        // ---------------------------------------------------------

        lowerGraphTableTitle.text(Translation.translate("lowerGraph.tableTitle", { amountUnit: nutrientUnit, nutrient, ageSexGroup }))
    }

    // getArcColour(treeNode): if a particular tree node in the data does not have a colour, 
    //  retrieves the colour of the most recent ancestor to the current node
    function getArcColour(treeNode) {
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
    function getRadius(treeNode) {
        if (treeNode.depth <= 1) {
            return GraphDims.lowerGraphCenterArcRadius;
        } else if (graphState == SunBurstStates.FilterOnlyLevel2) {
            return GraphDims.lowerGraph2LevelFilterArcRadius;
        }
        
        return GraphDims.lowerGraphArcRadius;
    }

    // getArcOuterRadius(treeNode): Retrieves the dimensions for the outer radius
    //  of the arc of a particular tree node
    function getArcOuterRadius(treeNode) {
        const radius = getRadius(treeNode);
        let result = Math.max(treeNode.y0 * radius, treeNode.y1 * radius - 1);

        if (treeNode.depth <= 1) {
            centerOuterRadius = result;
        } else {
            result -= radiusDiffFromCenterArc;
        }

        return result;
    }

    // getArcInnerRadius(treeNode): Retrives the dimensions for the inner radius
    //  of the arc of a particular tree node
    function getArcInnerRadius(treeNode) {
        let result = treeNode.y0 * GraphDims.lowerGraphArcRadius;

        if (treeNode.depth == 2 && radiusDiffFromCenterArc === undefined) {
            radiusDiffFromCenterArc = result - centerOuterRadius - GraphDims.lowerGraphCenterArcMargin;
        }

        return treeNode.depth > 1 ? result - radiusDiffFromCenterArc : result
    }

    // getArcMiddleRadius(treeNode): Retrives the dimensions for the middle radius
    //   of the arc of a particular tree node
    function getArcMiddleRadius(treeNode) {
        const outerRadius = getArcOuterRadius(treeNode);
        const innerRadius = getArcInnerRadius(treeNode);

        return innerRadius + (outerRadius - innerRadius) / 2;
    }

    // getLabelDY(treeNode): Retrieves the y positioning of the label text on the arc
    function getLabelDY(treeNode) {
        if (graphState == SunBurstStates.FilterOnlyLevel2) {
            return GraphDims.lowerGraph2LevelFilterArcRadius / 2 + (GraphDims.lowerGraph2LevelFilterArcRadius - GraphDims.lowerGraphArcRadius);
        } else if (treeNode.depth > 1) {
            return GraphDims.lowerGraphArcRadius / 2;
        }

        return (GraphDims.lowerGraphArcRadius - GraphDims.lowerGraphCenterArcRadius) / 2 + 5;
    }

    /* Shows label only when the arc has an angle over 0.05 */
    function labelVisible(d) {
        return d.x1 - d.x0 > 0.05
    }

    // getArcLabel(index): Retrieves the element for the label of the arc
    function getArcLabel(index) {
        return d3.select(`#arcLabel${index}`);
    }

    // labelAvailableLength(d): Retrieves the length of available space in a particular arc 'd'
    function labelAvailableLength(d, midRadius){
        const angle = d.x1 - d.x0;
        const arcLength = midRadius * angle - 2 * GraphDims.lowerGraphArcPadding;
        return arcLength;
    }

    /* Truncates the label based on the arc's width, replaces letters with ellipsis if too long */
    function labelTextFit(d, i){
        const midRadius = getArcMiddleRadius(d);
        const element = getArcLabel(i);
        if (!element.node()) return;
        const elementNode = element.node();
        const availableLength = labelAvailableLength(d, midRadius); 
        let text = d.data.name;

        element.attr("startOffset", 0);
        element.text(text);
        let textLength = getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize);
        let textTruncated = false;

        while (textLength > availableLength && text){
            text = text.slice(0, text.length - 1);
            element.text(`${text}...`);
            textLength = getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize);
            textTruncated = true;
        }

        if (textLength > availableLength) {
            element.text("");
        }

        // center text only if the text is not truncated
        let textX = 0;
        if ((d.x1 - d.x0) < 2 * Math.PI && !textTruncated) {
            textX = (d.x1 - d.x0) / 2.0 * midRadius - getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize) / 2.0;
        }

        if (textX < 0) {
            textX = 0;
        }

        element.attr("startOffset", GraphDims.lowerGraphArcPadding + textX);
    }

    /* Update food group description box */
    function updateInfoBox(d){
        let colour = GraphColours[d.data.row[FoodIngredientDataColNames.foodGroupLv1]];
        colour = colour === undefined ? null : colour;

        let foodGroupName = d.data.name;
        if (mouseOverFoodGroupName !== null && mouseOverFoodGroupName == foodGroupName) {
            return;
        }

        mouseOverFoodGroupName = foodGroupName;

        let desc = "";
        if (foodGroupName != Translation.translate("LegendKeys.All Items")) {
            desc = model.getFoodDescription(nutrient, foodGroupName);
        }

        // ---------- Updates the infobox --------------

        const infoBoxPadding = GraphDims.lowerGraphInfoBoxPadding;

        // change text
        const textDims = drawText({textGroup: lowerGraphInfoBox.textGroup, text: desc, width: GraphDims.lowerGraphInfoBoxWidth, 
                                   fontSize: GraphDims.lowerGraphInfoBoxFontSize, lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing, paddingLeft: infoBoxPadding, paddingRight: infoBoxPadding});

        // change colour
        lowerGraphInfoBox.highlight.attr("stroke", colour);

        // update the height of the info box to be larger than the height of the text
        let infoBoxHeight = lowerGraphInfoBox.highlight.node().getBBox()["height"];
        infoBoxHeight = Math.max(infoBoxHeight, infoBoxPadding + textDims.textBottomYPos + infoBoxPadding);
        lowerGraphInfoBox.highlight.attr("y2", infoBoxHeight);

        // ---------------------------------------------
    }

    // saveAsImage(): Saves the bar graph as an image
    function saveAsImage() {
        const svg = document.getElementById("lowerGraph").firstChild;
        saveSvgAsPng(svg, "SunburstGraph.png", {backgroundColor: "white"});
    }

    // downloadTable(): Exports the table of the bar graph as a CSV file
    function downloadTable() {
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + model.sunburstTable.csvContent);

        // creates a temporary link for exporting the table
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'SunBurstTable.csv');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}