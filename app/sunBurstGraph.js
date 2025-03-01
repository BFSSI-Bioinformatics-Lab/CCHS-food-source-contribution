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



import { GraphColours, GraphDims, TextAnchor, FontWeight, TextWrap, SunBurstStates, Colours, Translation, FoodIngredientDataColNames, MousePointer, SortIconClasses, SortStates, LowerGraphFoodGroupLv3ColInd } from "./assets.js";
import { TextTools } from "./backend.js";
import { getSelector, getTextWidth, drawWrappedText, drawText } from "./visuals.js";


const LegendKeyTreeDepth = 2;

export function lowerGraph(model){
    // nutrient selected
    let nutrient = model.nutrient;

    // state of the display for the sunburst graph
    let graphState = SunBurstStates.AllDisplayed;

    // ----------- Register different buttons -----------------

    // register the save image button
    d3.select("#lowerGraphSaveGraph").on("click", () => saveAsImage());

    // register the download table button
    const downloadButton = d3.select("#lowerGraphSaveTable").on("click", () => downloadDisplayedTable());
    const downloadAllDataButton = d3.select("#lowerGraphSaveAllData").on("click", () => downloadFullTable());

    // register the button to jump to the nutrient selection
    d3.select("#lowerGraphReturnToSelection").on("click", () => scrollToNutrientSelection());

    // --------------------------------------------------------

    // update the header widths of the table when the table is displayed
    //  so that the header of the table aligns with the body of the table
    const details = d3.select("#lowerTableDetails");

    // all the hover tooltips for the graph
    let hoverToolTips = {};

    // unit for the nutrient
    let nutrientUnit = "";

    // tree data for the sunburst
    let root;
    let children;

    // overall group for the sunburst
    let sunBurstGroup;

    // age-sex group for the sunburst
    let ageSexGroup;
    let ageSexGroupDisplay;

    // arcs for the sunburst
    let arc;            // arcs for the graph
    let label;          // label for each arc
    let path;           // path for teh text of the arc
    let hoverPath;      // detects the hovering for the arc

    // height of the overall tree data model for the sunburst
    let treeHeight;

    // titles for the graph and table
    let graphTitleText = ""
    let tableTitleText = ""

    // which arc is selected in the sunburst
    let selectedNodeIndex = 1;
    let selectedNode = null;
    let legendNodeIndices = {};

    // which key in the legend has been clicked
    let clickedLegendKey = null;

    // table column that is being sorted
    let sortedColIndex = null;
    let sortedColState = SortStates.Unsorted;

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

    // the id of the tooltip that is last shown on the screen
    let shownToolTipInd;

    const ageSexSelector = d3.select("#lowerGraphAgeSexSelect");

    const lowerGraphSvg = d3.select("#lowerGraph").append("svg")
    .attr("overflow", "visible")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;")
    .style("font", "10px sans-serif");

    // ------------------ draw the footnotes ------------------

    const footNoteWidth = width - 2 * GraphDims.lowerGraphFooterPaddingHor;

    const footNotesContainer = lowerGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.lowerGraphFooterPaddingHor}, ${GraphDims.lowerGraphHeight + GraphDims.lowerGraphTop})`);
    
    // foot note for excluding pregnancy and lactating
    const exclusionFootNoteTextBox = footNotesContainer.append("text")
        .attr("transform", `translate(${GraphDims.lowerGraphFooterPaddingHor}, 0)`)
        .attr("font-size", GraphDims.lowerGraphFooterFontSize);

    const exclusionFootNoteTextDims = drawText({textGroup: exclusionFootNoteTextBox, text: Translation.translate("FootNotes.excludePregnantAndLactating"), width: footNoteWidth, 
                                                fontSize: GraphDims.lowerGraphFooterFontSize});

    // foot note for the source text
    const sourceTextBox = footNotesContainer.append("text")
        .attr("transform", `translate(${GraphDims.lowerGraphFooterPaddingHor}, ${exclusionFootNoteTextDims.textBottomYPos + GraphDims.lowerGraphFootNoteSpacing})`)
        .attr("font-size", GraphDims.lowerGraphFooterFontSize)
        .attr("visibility", "hidden");

    drawText({textGroup: sourceTextBox, text: Translation.translate("FootNotes.sourceText"), width: footNoteWidth, fontSize: GraphDims.lowerGraphFooterFontSize});

    // --------------------------------------------------------
    // --------------- draws the info box ---------------------
    
    // attributes for the info box
    const infoBox = {};
    let infoBoxHeight = GraphDims.lowerGraphInfoBoxHeight;

    // group for the info box
    infoBox.group = lowerGraphSvg.append("g")
        .attr("transform", `translate(${lowerGraphRightXPos}, ${GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight - GraphDims.lowerGraphInfoBoxHeight - GraphDims.lowerGraphInfoBoxMarginBtm})`);

    // border line for the info box
    infoBox.highlight = infoBox.group.append("line")
        .attr("x1", GraphDims.lowerGraphInfoBoxBorderWidth / 2)
        .attr("x2", GraphDims.lowerGraphInfoBoxBorderWidth / 2)
        .attr("y2", infoBoxHeight)
        .attr("stroke-width", GraphDims.lowerGraphInfoBoxBorderWidth)
        .attr("visibility", "visible")
        .attr("stroke-linecap", "round");

    // container to hold the title
    infoBox.titleGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.lowerGraphInfoBoxTitleFontSize)
        .attr("font-weight", FontWeight.Bold);

    // container to hold the subtitle
    infoBox.subTitleGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.lowerGraphInfoBoxFontSize)
        .attr("font-weight", FontWeight.Bold);

    // container to hold the text
    infoBox.textGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.lowerGraphInfoBoxFontSize)

    const lowerGraphInfoBox = infoBox;

    // --------------------------------------------------------

    // ----------------- draws the legend ---------------------
    
    // attributes for the legend
    const legendItemPaddingHor = 0;
    const legendItemPaddingVert = 2;
    const legendItemAllFoodGroupPaddingVert = 20;
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
    const legendDataLen = legendData.length;
    for (let i = 0; i < legendDataLen; ++i) {
        let legendKeyText = Translation.translate(`LegendKeys.${legendData[i][0]}`);
        let legendKeyColour = legendData[i][1];

        // ***************** draws a key in the legend *********************
        
        const legendItemGroup = legendGroup.append("g")
            .attr("transform", `translate(0, ${currentLegendItemYPos})`)
            .attr("tabindex", "0")
            .style("outline-offset", "2px")
            .on("focus", (d, index, elements) => {
                d3.select(elements[index]).style("outline", "2px solid black");
            })
            .on("focusout", (d, index, elements) => {
                d3.select(elements[index]).style("outline", "none");
            });

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

        drawText({textGroup, fontSize: legendItemFontSize, textWrap: TextWrap.NoWrap, text: TextTools.getDisplayText(legendKeyText), textX, textY});

        const legendItem = {group: legendItemGroup, colourBox, textGroup, name: legendKeyText, colour: legendKeyColour};

        // *****************************************************************

        currentLegendItemYPos += legendItemPaddingVert + legendItemGroup.node().getBBox()["height"];

        // whether to add extra spacing for the "All Food Groups" legend key
        if (i == legendData.length - 2) {
            currentLegendItemYPos += legendItemAllFoodGroupPaddingVert;
        } else {
            currentLegendItemYPos += legendItemPaddingVert;
        }

        legendItems.push(legendItem);
    }

    const allFoodGroupsName = Translation.translate(`LegendKeys.All Items`);

    // add the mouse events to the keys of the legend
    for (const legendItem of legendItems) {
        const name = legendItem.name;
        const colour = legendItem.colour;
        const legendItemGroup = legendItem.group;
        const isAllItems = name == allFoodGroupsName;

        const dummyRow = {};
        dummyRow[FoodIngredientDataColNames.foodGroupLv1] = name;
        const dummyArcData = {data: {name, row: dummyRow}};

        legendItemGroup.on("mouseenter", () => { 
            legendItemGroup.style("cursor", MousePointer.Pointer);
            updateInfoBox(dummyArcData); 
        });
        legendItemGroup.on("mouseleave", () => { 
            legendItemGroup.style("cursor", MousePointer.Default);
            hideInfoBox(); 
        });
        legendItemGroup.on("click", () => onLegendKeyClick(name, isAllItems, dummyArcData));
        legendItemGroup.on("keypress", () => onLegendKeyClick(name, isAllItems, dummyArcData));
        legendItemGroup.on("mouseover", () => { 
            legendItemGroup.style("cursor", MousePointer.Pointer);
            updateInfoBox(dummyArcData); 
        });
    }

    // --------------------------------------------------------

    const lowerGraphChartHeading = lowerGraphSvg.append("g")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", GraphDims.lowerGraphChartHeadingFontSize)
        .attr("x", width / 2)
        .attr("y", GraphDims.lowerGraphTop - GraphDims.lowerGraphChartHeadingFontSize * 0.75)
        .attr("font-weight", FontWeight.Bold);

    const lowerGraphSunburst = lowerGraphSvg.append("g")
    .attr("transform", `translate(${GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth / 2}, ${GraphDims.lowerGraphTop + GraphDims.lowerGraphHeight / 2})`)

    const lowerGraphFilterGroupsButton = d3.select("#lowerGraphFilterGroupsButton");

    const lowerGraphTable = d3.select("#lowerGraphTable");
    const lowerGraphTableTitle = d3.select("#lowerGraphTableTitle");

    // remove any dummy tables that says "no data available in table" produced by JQuery due to a
    //  race condition of D3 adding rows into the scroll table and JQuery setting up the scroll table
    lowerGraphTable.selectAll("thead").remove();
    lowerGraphTable.selectAll("tbody").remove();

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
                .text(d => Translation.translate(`ageSexGroupDisplay.${model.ageSexGroupHeadingKeys[d]}`));
    
        ageSexGroup = getSelector("#lowerGraphAgeSexSelect");
        ageSexGroupDisplay = Translation.translate(`ageSexGroupDisplay.${model.ageSexGroupHeadingKeys[ageSexGroup]}`);

        updateGraphTitle();

        // update the CSV table for all the data to the nutrient (includes all age-sex groups)
        model.createSunburstAllTable();


        drawSunburst(nutrient);
    }

    // onLegendKeyClick(name, isAllItems, dummyArcData): When the user clicks on a key of the legend
    function onLegendKeyClick(name, isAllItems, dummyArcData) {
        if (!isAllItems && (clickedLegendKey === null || clickedLegendKey != name)) {
            clickedLegendKey = name;
        } else {
            clickedLegendKey = null;
        }

        if (clickedLegendKey === null && graphState !== SunBurstStates.FilterOnlyLevel2) {
            arcOnClick(null, legendNodeIndices[allFoodGroupsName]);
        } else if (graphState == SunBurstStates.AllDisplayed) {
            arcOnClick(null, legendNodeIndices[name]);
        }

        // on mobile phones, hide the last shown tooltip and show the infobox when clicking on the legend item
        arcUnHover();
        updateInfoBox(dummyArcData);
    }


    // destorySunburstGraph(): Removes only the graph of the sunburst
    function destroySunburstGraph() {
        if (path !== undefined) path.remove();
        if (label !== undefined) label.remove();
        if (hoverPath !== undefined) hoverPath.remove();

        // remove the tooltips
        for (const hoverCardId in hoverToolTips) {
            hoverToolTips[hoverCardId].group.remove();
        }

        hoverToolTips = {};
    }


    // drawSunburstGraph(): Draws only the graph of the sunburst
    function drawSunburstGraph(sunburstData) {
        // Append the arcs and pass in the data
        path = lowerGraphSunburst.append("g")
            .selectAll("path")
            .data(sunburstData)
            .join("path")
            .attr("fill", d => getArcColour(d))
            .attr("fill-opacity", d => arcVisible(d.current) ? 1 : 0)
            .property("id", (d, i) => `arcPath${i}`)
            .attr("d", d => arc(d.current));
    
        /* Update title of each individual arc, which appears when hovering over label */
        const format = d3.format(",d");
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
        
        /* Name of each arc */
        label = lowerGraphSunburst.append("g")
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .selectAll("text")
            .data(sunburstData)
            .join("text")
            .attr("dy", d => getLabelDY(d))
            .attr("font-size", GraphDims.lowerGraphArcLabelFontSize)
            .attr("letter-spacing", GraphDims.lowerGraphArcLabelLetterSpacing)
            .attr("fill-opacity", d => +labelVisible(d.current))
                .append("textPath") // make the text following the shape of the arc
                .attr("id", (d, i) => `arcLabel${i}`)
                .attr("href", (d, i) => `#arcPath${i}`);

        /* Create invisible arc paths on top of graph in order to detect hovering */
        hoverPath = lowerGraphSunburst.append("g")
            .selectAll("path")
            .data(sunburstData)
            .join("path")
            .attr("fill-opacity", 0)
            .attr("pointer-events", "auto")
            .attr("d", d => arc(d.current))
            .style("cursor", "pointer")
            .attr("tabindex", "0")
            .classed("noFocusOutline", true);
    
        hoverPath.on("mousemove", (data, index) => { arcHover(data, index) });
        hoverPath.on("mouseenter", (data, index) => { arcHover(data, index) });
        hoverPath.on("mouseover", (data, index) => { arcHover(data, index) });
        hoverPath.on("mouseout", (data, index) => { arcUnHover(data, index) });
        hoverPath.on("touchstart", (data, index) => { arcUnHover(data, index) });
        hoverPath.on("focus", (data, index) => { 
            arcFocus(data, index);
            arcHover(data, index);
        });
        hoverPath.on("focusout", (data, index) => { 
            arcUnfocus(data, index); 
            arcUnHover(data, index);
        });
        
        // Draw the tooltips on top of the graph
        const mouseOverBoxes = lowerGraphSunburst.append("g");
        root.descendants().slice(1).forEach((d, i) => hoverCard(d, mouseOverBoxes, i, nutrient));
    }


    /* Creation of tooltip */
    function hoverCard(d, root, i, nutrient){
        const arcColour = d3.select(`#arcPath${i}`).attr("fill");

        let interpretationValue = d.data.interpretationValue;
        let context = undefined;

        if (interpretationValue == "F" || interpretationValue == "X") {
            context = "OnlyInterpretation";
        } else if (typeof interpretationValue === "string") {
            context = "WithInterpretation"
        }

        /* Content of tooltip */
        const title = TextTools.getDisplayText(Translation.translate("lowerGraph.toolTipTitle", {name: d.data.name}));
        const lines = Translation.translate("lowerGraph.toolTip", { 
            context: context,
            returnObjects: true, 
            percentage: Translation.translateNum(d.data.row.Percentage),
            parentGroup: d.depth > 1 ? d.parent.data.name : "",
            parentPercentage: Translation.translateNum(d.depth > 1 ? d.data.row.Percentage / d.parent.data.row.Percentage * 100 : 0),
            nutrient,
            interpretationValue
        });

        const toolTipId = `arcHover${i}`;

        // ------- draw the tooltip ------------

        // attributes for the tool tip
        const toolTip = {};
        let toolTipWidth = GraphDims.lowerGraphTooltipMinWidth;
        let toolTipHeight = GraphDims.lowerGraphTooltipHeight;
        let currentTextGroupPosY = GraphDims.lowerGraphTooltipPaddingVert + GraphDims.lowerGraphTooltipTextPaddingVert;
        const textGroupPosX = GraphDims.lowerGraphTooltipBorderWidth + GraphDims.lowerGraphTooltipPaddingHor +  GraphDims.lowerGraphTooltipTextPaddingHor;

        const toolTipHighlightXPos = GraphDims.lowerGraphTooltipPaddingHor + GraphDims.lowerGraphTooltipBorderWidth / 2;

        // draw the container for the tooltip
        toolTip.group = root.append("g")
            .attr("id",  toolTipId)
            .attr("opacity", 0)
            .style("pointer-events", "none");

        // draw the background for the tooltip
        toolTip.background = toolTip.group.append("rect")
            .attr("fill", Colours.White)
            .attr("stroke", arcColour)
            .attr("stroke-width", 1)
            .attr("rx", 5);

        // draw the highlight
        toolTip.highlight = toolTip.group.append("line")
            .attr("x1", toolTipHighlightXPos)
            .attr("x2", toolTipHighlightXPos)
            .attr("y1", GraphDims.lowerGraphTooltipPaddingVert)
            .attr("stroke", arcColour) 
            .attr("stroke-width", GraphDims.lowerGraphTooltipBorderWidth)
            .attr("stroke-linecap", "round");

        // draw the title
        toolTip.titleGroup = toolTip.group.append("text")
            .attr("font-size", GraphDims.lowerGraphTooltipFontSize)
            .attr("font-weight", FontWeight.Bold)
            .attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);

        const titleDims = drawText({textGroup: toolTip.titleGroup, text: title, fontSize: GraphDims.lowerGraphTooltipFontSize, 
                                    textWrap: TextWrap.NoWrap, paddingLeft: GraphDims.lowerGraphTooltipPaddingHor, paddingRight: GraphDims.lowerGraphTooltipPaddingHor});

        currentTextGroupPosY += titleDims.textBottomYPos + GraphDims.lowerGraphTooltipTitleMarginBtm;

        // draw the text
        toolTip.textGroup = toolTip.group.append("text")
            .attr("font-size", GraphDims.lowerGraphTooltipFontSize)
            .attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);

        const textDims = drawText({textGroup: toolTip.textGroup, text: lines, fontSize: GraphDims.lowerGraphTooltipFontSize, 
                                    textWrap: TextWrap.NoWrap, paddingLeft: GraphDims.lowerGraphTooltipPaddingHor, paddingRight: GraphDims.lowerGraphTooltipPaddingHor});

        currentTextGroupPosY += textDims.textBottomYPos;

        // update the height of the tooltip to be larger than the height of all the text
        toolTipHeight = Math.max(toolTipHeight, currentTextGroupPosY + GraphDims.lowerGraphTooltipPaddingVert + GraphDims.lowerGraphTooltipTextPaddingVert);
        toolTip.background.attr("height", toolTipHeight);
        toolTip.highlight.attr("y2", toolTipHeight - GraphDims.lowerGraphTooltipPaddingVert);

        // update the width of the tooltip to be larger than the width of all the text
        toolTipWidth = Math.max(toolTipWidth, 2 * GraphDims.lowerGraphTooltipPaddingHor + GraphDims.lowerGraphTooltipBorderWidth + 2 * GraphDims.lowerGraphTooltipTextPaddingHor + Math.max(titleDims.width, textDims.width));
        toolTip.background.attr("width", toolTipWidth);

        toolTip.width = toolTipWidth;

        // -------------------------------------

        hoverToolTips[toolTipId] = toolTip;
        positionHoverCard(toolTip, d);
    }


    // Source reference: https://observablehq.com/@d3/zoomable-sunburst
    function drawSunburst(nutrient){
        // reset the selected arc that was clicked
        selectedNodeIndex = 1;
        selectedNode = null;

        // reset the clicked legend key
        clickedLegendKey = null;

        // get the units for the nutrient
        nutrientUnit = model.getNutrientUnit()

        lowerGraphSunburst.selectAll("g").remove();
        const groupedPercentages = model.buildSunBurstTree(nutrient, ageSexGroup);
    
        // Compute the layout.
        const hierarchy = d3.hierarchy(groupedPercentages)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        treeHeight = hierarchy.height;
    
        root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1])
            (hierarchy);
        children = root.descendants();
    
        root.each(d => d.current = d);
    
        // Create the arc generator.
        arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(d => getRadius(d) * 1.5)
            .innerRadius(d => getArcInnerRadius(d))
            .outerRadius(d => getArcOuterRadius(d));

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
        sunBurstGroup = lowerGraphSunburst.append("circle")
            .datum(root.descendants())
            .attr("r", d => getRadius(d))
            .attr("fill", "none")
            .attr("pointer-events", "all");
    
        // filter on level 2 groups on button click
        lowerGraphFilterGroupsButton.on("click", filterOnLevel2Groups);

        // update the node indices for the food groups referenced by the legend
        legendNodeIndices = {};
        const sunBurstAllItemsName = Translation.translate("lowerGraph.allItems");
        let legendKeys = Translation.translate("LegendKeys", { returnObjects: true });
        const sunBurstLegendAllItemsName = legendKeys["All Items"];

        legendKeys = new Set(Object.values(legendKeys).map((legendKeyName) => legendKeyName.toLowerCase()));
        const childrenLen = children.length;

        for (let i = 0; i < childrenLen; ++i) {
            const name = children[i].data.name;
            if (legendKeys.has(name.toLowerCase())) {
                legendNodeIndices[name] = i;
            } else if (name == sunBurstAllItemsName) {
                legendNodeIndices[sunBurstLegendAllItemsName] = i;
            }
        }
        
        // update the graph based on which mode is on
        if (graphState == SunBurstStates.AllDisplayed) {
            filterAllFoodGroups();
        } else {
            filterOnLevel2Groups();
        }
    }

    /* Return function defined above that updates the graph */
    return drawGraph;


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

    // updateSortedColInd(prevGraphState, currentGraphState): Updates the index for the sorted column
    //  depending whether the table includes the 'Food Group Level 3' column
    function updateSortedColInd(prevGraphState, currentGraphState) {
        const becameFilteredOnlyLevel2 = prevGraphState == SunBurstStates.AllDisplayed && currentGraphState == SunBurstStates.FilterOnlyLevel2;

        if (becameFilteredOnlyLevel2 && sortedColIndex == LowerGraphFoodGroupLv3ColInd) {
            sortedColIndex = null;
            sortedColState = SortStates.Unsorted;
        } else if (becameFilteredOnlyLevel2 && sortedColIndex > LowerGraphFoodGroupLv3ColInd) {
            --sortedColIndex;
        } else if (prevGraphState == SunBurstStates.FilterOnlyLevel2 && currentGraphState == SunBurstStates.AllDisplayed && sortedColIndex >= LowerGraphFoodGroupLv3ColInd) {
            ++sortedColIndex;
        }
    }

    // filterOnLevel2Groups(): Display only level 2 groups of the Sun Burst Graph
    function filterOnLevel2Groups(){
        const prevGraphState = graphState;
        graphState = SunBurstStates.FilterOnlyLevel2;
        updateSortedColInd(prevGraphState, graphState);

        const highestDepth = 3;
        let acc = 0;

        /* Sort level 2 arcs by value amount */
        const sortedGroups = root.descendants().slice(1).sort((a, b) => d3.descending(a.value, b.value));

        destroySunburstGraph();
        drawSunburstGraph(sortedGroups);

        // disable the on-click event for the arcs
        hoverPath.on("click", null);
        hoverPath.on("keypress", null);

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

        // increase the thickness of the arcs
        updateArcThickness();
        
        transitionArcs(1000);
        setFilterButton("lowerGraph.seeAllGroups", "assets/sunburst-icon.png", () => filterAllFoodGroups());

        // update the filter for the table of the sunburst
        drawTable();

        // update the title of the graph
        updateGraphTitle();
    }

    // filterAllFoodGroups(): Display all levels of the Sun Burst Graph
    function filterAllFoodGroups() {
        const prevGraphState = graphState;
        graphState = SunBurstStates.AllDisplayed;
        updateSortedColInd(prevGraphState, graphState);

        root.each(d => d.target = {
            depth: d.depth,
            data: d.data,
            value: d.value,
            x0: d.x0,
            x1: d.x1,
            y0: d.y0,
            y1: d.y1,
        });

        destroySunburstGraph();
        drawSunburstGraph(root.descendants().slice(1));

        // enable the on-click event for the arcs
        hoverPath.on("click", (e, i) => { arcOnClick(e,i + 1); });
        hoverPath.on("keypress", (e, i) => {
            if (d3.event.key != "Enter") return;
            arcOnClick(e,i + 1);
            arcHover(e, i);
        });

        // set back the thickness of the arcs back to its original thickness
        updateArcThickness();

        transitionArcs(1000);
        setFilterButtonToLevel2Groups();
        
        // Comment out the lines below if we want to get back to the previously clicked arc
        selectedNodeIndex = 1;
        selectedNode = null;

        arcOnClick(null, selectedNodeIndex);

        // update the filter for the table of the sunburst
        drawTable();

        // update the title for the graph
        updateGraphTitle();
    }

    // setFilterButton(translationKey, icon, onClickAction): Changes the state of the filter button
    //  based on 'translationKey' and 'onClickAction'
    function setFilterButton(translationKey, icon, onClickAction) {
        const buttonText = Translation.translate(translationKey);

        // change the icon
        lowerGraphFilterGroupsButton.select("img")
            .attr("src", icon)
            .attr("alt", buttonText);
        
        // set the text for the button
        const buttonTextGroup = lowerGraphFilterGroupsButton.select("span")
        buttonTextGroup.text(buttonText)

        // register the event once the button is clicked
        lowerGraphFilterGroupsButton.on("click", onClickAction);
    }

    // setFilterButtonToLevel2Groups(): Changes the filter button to be to filter on level 2 groups
    function setFilterButtonToLevel2Groups() {
        setFilterButton("lowerGraph.seeLevel2Groups", "assets/donut-icon.png", () => filterOnLevel2Groups());
    }

    /* Shows arc only when the arc has a depth between 1-4 and a nonzero angle */
    function arcVisible(d) {
        return d.depth <= treeHeight && d.depth >= 1 && d.x1 > d.x0;
    }

    /* Positions tool tip according to arc position */
    function positionHoverCard(toolTip, d){
        // computes the relative angle (in radians) for where the arc is located.
        // note: 
        //  - see diagram on the unit circle from trigonometry as a reference:
        //    https://www.radfordmathematics.com/functions/circular-functions/definition-cosine-sine-tangent/unit-circle-sine-cosine-definition.png
        //
        // let 'x' = relative angle
        // let 'r' = distance from the origin,
        //
        // then the coordinate for the arc would be (rcos(x), rsin(x))
        const relativeAngle = (d.x1 + d.x0)/2 + 3 * Math.PI / 2;
        const relativeAngleX =  Math.cos(relativeAngle);

        let x = GraphDims.lowerGraphArcRadius * relativeAngleX * (d.depth) + (GraphDims.lowerGraphArcRadius - GraphDims.lowerGraphCenterArcRadius) * relativeAngleX;
        const y = GraphDims.lowerGraphArcRadius * Math.sin(relativeAngle) * (d.depth);

        // move the tooltip to the left side of the arc if the arc is located at the right side of the graph,
        // so that the tooltip will not block the description box
        if (x > 0) {
            x -= toolTip.width;
            x = Math.max(x, -GraphDims.lowerGraphWidth / 2); // don't want tooltip to move outside of the graph
        }

        toolTip.group.attr("transform", `translate(${x}, ${y})`);
    }

    // arcOnClick(event, i): Handle zoom on click when clicking on an arc.
    function arcOnClick(event, i) {
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
        drawTable();

        // update the title of the graph based off the selected arc
        updateGraphTitle();

        if (isTransitionArc) {
            transitionArcs();
        }

        // set the correct state for the filter button
        setFilterButtonToLevel2Groups();

        // whether to reset the selected key of the legend
        if (selectedNode.depth != LegendKeyTreeDepth) {
            clickedLegendKey = null;
        }
    }

    /* Make the opacity of tooltip 1 */
    function arcHover(d, i){
        // on mobile phones, we want the last shown tooltip to disappear
        if (shownToolTipInd !== undefined) {
            d3.select(`#arcHover${shownToolTipInd}`).attr("opacity", 0);
        }

        shownToolTipInd = i;
        d3.select(`#arcHover${shownToolTipInd}`).attr("opacity", 1);
        updateInfoBox(d);
    }

    /* Make the opacity of tooltip 0 */
    function arcUnHover(d, i){
        if (i === undefined) {
            i = shownToolTipInd;
        }

        if (i === undefined) return;
        d3.select(`#arcHover${i}`).attr("opacity", 0);
        hideInfoBox();
    }

    // arcFocus(d, i): When the arc is being focused on
    function arcFocus(d, i) {
        d3.select(`#arcPath${i}`)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    }

    // arcUnfocuse(d, i): When the arc is not being focused anymore
    function arcUnfocus(d, i) {
        d3.select(`#arcPath${i}`)
            .attr("stroke", "none")
            .attr("stroke-width", 0);
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
            .attr("fill", "black")
            .attr("font-weight", d => {
                if (selectedNode !== null && selectedNode.target.data.name == d.target.data.name) {
                    return FontWeight.Bold;
                }

                return FontWeight.Normal;
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
            .attr("tabindex", d => arcVisible(d.target) ? "0" : "-1")
    }

    // getTitleTranslateKeys(): Retrieves the translation keys used for picking the correct title for the sunburst
    function getTitleTranslateKeys() {
        const sunBurstNode = selectedNode ?? { depth: 1, data: {name: Translation.translate("LegendKeys.All Items")}};

        let filterTranslateKey = ""
        if (graphState == SunBurstStates.FilterOnlyLevel2) {
            filterTranslateKey = "Filter Only Level 2";
        } else if (sunBurstNode.depth == 1) {
            filterTranslateKey = "All Items";
        } else if (sunBurstNode.depth > 1) {
            filterTranslateKey = "Filtered Data";
        }

        const ageGroupTranslateKey = ageSexGroup == Translation.translate("AgeSexGroupHeadings.Population1Up") ? "Population1Up" : "OtherAgeGroups";
        return {filterTranslateKey, ageGroupTranslateKey};
    }

    // updateGraphTitle(): Updates the title for the graph
    function updateGraphTitle() {
        const titleKeys = getTitleTranslateKeys();
        const foodGroup = selectedNode !== null ? selectedNode.data.name : "";
        const foodGroupArticle = model.getFoodGroupArticle(foodGroup);

        graphTitleText = TextTools.getDisplayText(Translation.translate(`lowerGraph.graphTitle.${titleKeys.ageGroupTranslateKey}.${titleKeys.filterTranslateKey}`, 
                                                { amountUnit: nutrientUnit, nutrient, ageSexGroup: ageSexGroupDisplay, foodGroup, article: foodGroupArticle}));

        drawWrappedText({textGroup: lowerGraphChartHeading, text: graphTitleText, width: GraphDims.lowerGraphWidth, 
                         textX: GraphDims.lowerGraphLeft + GraphDims.lowerGraphWidth / 2, fontSize: GraphDims.lowerGraphChartHeadingFontSize});    
    }

    // draws the table for the sun burst graph
    function drawTable(reloadData = true){
        const sunBurstNode = selectedNode ?? { depth: 1, data: {name: Translation.translate("LegendKeys.All Items")}} 

        // update the text for the title
        const titleKeys = getTitleTranslateKeys();
        const foodGroup = sunBurstNode.data.name;
        const foodGroupArticle = model.getFoodGroupArticle(foodGroup);

        tableTitleText = TextTools.getDisplayText(Translation.translate(`lowerGraph.tableTitle.${titleKeys.ageGroupTranslateKey}.${titleKeys.filterTranslateKey}`, { amountUnit: nutrientUnit, nutrient, ageSexGroup: ageSexGroupDisplay, foodGroup, article: foodGroupArticle }));
        
        const sunBurstTable = reloadData ? model.createSunburstDisplayedTable(ageSexGroup, graphState, sunBurstNode.depth, sunBurstNode.data.name, tableTitleText) : model.sunburstTable;

        // --------------- draws the table -------------------------

        /* Create heading columns */
        const amountLeftIndex = graphState == SunBurstStates.AllDisplayed ? 3 : 2;

        lowerGraphTableHeading.selectAll("tr").remove();
        const tableHeaders = lowerGraphTableHeading.append("tr")
            .selectAll("th")
            .data(sunBurstTable.headings)
            .enter()
            .append("th")
                .attr("class", "text-center lowerTableHeader")
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
                .style("color", (d, i) => {
                    const colNum = (i - amountLeftIndex) % 4;
                    if (i >= amountLeftIndex && (colNum === 3 || colNum === 1)) {
                        return "rgba(51,51,51,0.8)";
                    }

                    return "rgba(51,51,51,1)";
                })
                .attr("colspan", 1)
                .text(headingData => Translation.translate(headingData.heading))
                
                // add the sorting event listeners
                .filter((headingData, headingInd) => { return sunBurstTable.compareFuncs[headingInd] !== null })
                .on("click", (headingData) => { 
                    sortedColState = headingData.ind == sortedColIndex ? SortStates.getNext(sortedColState) : SortStates.Ascending; 
                    sortedColIndex = headingData.ind;
                    drawTable(false);
                })
                .on("mouseenter", (headingData, ind, tableHeaders) => { tableHeaders[ind].style.cursor = MousePointer.Pointer; })
                .on("mouseleave", (headingData, ind, tableHeaders) => { tableHeaders[ind].style.cursor = MousePointer.Default; })

                // add in the sorting icon
                .append("i")
                .attr("class", (headingData) => { return `sortIcon ${sortedColIndex == headingData.ind ? SortIconClasses[sortedColState] : SortIconClasses[SortStates.Unsorted]}` })
                .attr("aria-hidden", true);

        // sort the table data
        let sunBurstTableDataRows = sunBurstTable.table;
        const hasCompareFunc = sortedColIndex !== null && sunBurstTable.compareFuncs[sortedColIndex] !== null;

        if (hasCompareFunc && sortedColState == SortStates.Ascending) {
            sunBurstTableDataRows = sunBurstTableDataRows.toSorted((row1, row2) => { return sunBurstTable.compareFuncs[sortedColIndex](row1 [sortedColIndex], row2[sortedColIndex]) });
        } else if (hasCompareFunc && sortedColState == SortStates.Descending) {
            sunBurstTableDataRows = sunBurstTableDataRows.toSorted((row1, row2) => { return sunBurstTable.compareFuncs[sortedColIndex](row2[sortedColIndex], row1[sortedColIndex]) });
        }

        // translate the numbers for French
        const sunBurstDisplayedTable = [];
        for (const row of sunBurstTableDataRows) {
            const currentRow = [];
            const colLen = row.length;
            for (let i = 0; i < colLen; ++i) {
                currentRow.push(model.sunburstTable.colIsNumbered[i] ? Translation.translateNum(row[i]) : row[i]);
            }

            sunBurstDisplayedTable.push(currentRow);
        }

        lowerGraphTableBody.selectAll("tr").remove();

        // create the rows for the table
        // Note: change 'sunBurstDisplayedTable' to 'sunBurstTableDataRows' if we want the app to display French numbers
        //  with a decimal point instead of a comma
        for (const row of sunBurstDisplayedTable) {
            const newRow = lowerGraphTableBody.append("tr")
                .selectAll("td")
                .data(row)
                .enter()
                .append("td")
                    .attr("colspan", 1)
                    .text((d) => (Number.isNaN(d) || d === "") ? " - " : d)
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
                    .style("color", (d, i) => {
                        const colNum = (i - amountLeftIndex) % 4;
                        if (i >= amountLeftIndex && (colNum === 3 || colNum === 1)) {
                            return "rgba(51,51,51,0.8)";
                        }

                        return "rgba(51,51,51,1)";
                    });
        }

        // ---------------------------------------------------------

        lowerGraphTableTitle.text(Translation.translate("popUpTableTitle", { title: tableTitleText }));
    }

    // getArcColour(treeNode): if a particular tree node in the data does not have a colour, 
    //  retrieves the colour of the most recent ancestor to the current node
    function getArcColour(treeNode) {
        let foundColour;

        while(foundColour === undefined && treeNode.depth > 1) {
            foundColour = GraphColours[Translation.translate(`LegendKeyVars.${treeNode.data.name}`)];
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
        let text = TextTools.getDisplayText(d.data.name);

        element.attr("startOffset", 0);
        element.text(text);
        let textLength = getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize, undefined, GraphDims.lowerGraphArcLabelLetterSpacing);
        let textTruncated = false;

        while (textLength > availableLength && text){
            text = text.slice(0, text.length - 1);
            element.text(`${text}...`);
            textLength = getTextWidth(text, GraphDims.lowerGraphArcLabelFontSize, undefined, GraphDims.lowerGraphArcLabelLetterSpacing);
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

    // hideInfoBox(): Hides the info box
    function hideInfoBox() {
        drawText({textGroup: lowerGraphInfoBox.textGroup});
        drawText({textGroup: lowerGraphInfoBox.titleGroup});
        drawText({textGroup: lowerGraphInfoBox.subTitleGroup});
        lowerGraphInfoBox.highlight.attr("stroke", Colours.None);
    }

    /* Update food group description box */
    function updateInfoBox(d){
        let foodGroupName = d.data.name;
        mouseOverFoodGroupName = foodGroupName;

        let desc = "";
        const isAllFoodGroups = (foodGroupName == Translation.translate("lowerGraph.allItems") || foodGroupName == Translation.translate("LegendKeys.All Items"));
        if (!isAllFoodGroups) {
            desc = model.getFoodDescription(nutrient, foodGroupName);
        }

        let colour = GraphColours[Translation.translate(`LegendKeyVars.${d.data.row[FoodIngredientDataColNames.foodGroupLv1]}`)];
        colour = (colour === undefined || isAllFoodGroups) ? null : colour;

        // ---------- Updates the infobox --------------

        const textGroupPosX = GraphDims.lowerGraphInfoBoxBorderWidth + GraphDims.lowerGraphInfoBoxPadding;
        let currentTextGroupPosY = GraphDims.lowerGraphInfoBoxPadding;

        // change the title
        const titleDims = drawText({textGroup: infoBox.titleGroup, text: isAllFoodGroups ? "" : Translation.translate("infoBoxTitle"), width: GraphDims.lowerGraphInfoBoxWidth,
                                    fontSize: GraphDims.lowerGraphInfoBoxTitleFontSize, lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing, paddingLeft: GraphDims.lowerGraphInfoBoxPadding, paddingRight: GraphDims.lowerGraphInfoBoxPadding});

        // change the subtitle
        const subTitleDims = drawText({textGroup: infoBox.subTitleGroup, text: isAllFoodGroups ? "" : TextTools.getDisplayText(foodGroupName), width: GraphDims.lowerGraphInfoBoxWidth,
                                       fontSize: GraphDims.lowerGraphInfoBoxFontSize, lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing, paddingLeft: GraphDims.lowerGraphInfoBoxPadding, paddingRight: GraphDims.lowerGraphInfoBoxPadding});

        // change text
        const textDims = drawText({textGroup: lowerGraphInfoBox.textGroup, text: desc, width: GraphDims.lowerGraphInfoBoxWidth, 
                                   fontSize: GraphDims.lowerGraphInfoBoxFontSize, lineSpacing: GraphDims.lowerGraphInfoBoxLineSpacing, paddingLeft: GraphDims.lowerGraphInfoBoxPadding, paddingRight: GraphDims.lowerGraphInfoBoxPadding});

        // update the position of the title
        lowerGraphInfoBox.titleGroup.attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);
        currentTextGroupPosY += titleDims.textBottomYPos + GraphDims.lowerGraphInfoBoxTitleMarginBtm + GraphDims.lowerGraphInfoBoxPadding;

        // update the position of the subtitle
        lowerGraphInfoBox.subTitleGroup.attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);
        currentTextGroupPosY += subTitleDims.textBottomYPos;

        // update the position for the text box of the description
        lowerGraphInfoBox.textGroup.attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);
        currentTextGroupPosY += textDims.textBottomYPos;

        // change colour
        lowerGraphInfoBox.highlight.attr("stroke", colour);

        // update the height of the info box to be larger than the height of the text
        let infoBoxHeight = Math.max(GraphDims.lowerGraphInfoBoxHeight,  currentTextGroupPosY + GraphDims.lowerGraphInfoBoxPadding);
        lowerGraphInfoBox.highlight
            .attr("y1", GraphDims.lowerGraphInfoBoxPadding + titleDims.textBottomYPos + GraphDims.lowerGraphInfoBoxTitleMarginBtm)
            .attr("y2", infoBoxHeight);

        // ---------------------------------------------
    }

    // saveAsImage(): Saves the bar graph as an image
    async function saveAsImage() {
        // use await so that the below operations can happen in the order they are listed
        //  to simulate a mutex.
        // 
        // We do not want the operations to run at the same time or have the compiler reorder the lines for optimization.
        //  (or else you may have a picture of a graph without the source text)
        // https://blog.mayflower.de/6369-javascript-mutex-synchronizing-async-operations.html
        await sourceTextBox.attr("visibility", "visible");
        const svg = document.getElementById("lowerGraph").firstChild;
        await saveSvgAsPng(svg, `${graphTitleText}.png`, {backgroundColor: "white"});
        await sourceTextBox.attr("visibility", "hidden");
    }

    // downloadDisplayedTable(): Exports the displayed table of the sunburst graph as a CSV file
    function downloadDisplayedTable() {
        const universalBOM = "\uFEFF";
        const encodedUri = encodeURI(universalBOM + model.sunburstTable.csvContent);

        // creates a temporary link for exporting the table
        const link = document.createElement('a');
        link.setAttribute('href', "data:text/csv;charset=utf-8," + encodedUri);
        link.setAttribute('download', `${tableTitleText}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // downloadFullTable(): Exports the table for all the data of the sunburst graph as a CSV file
    function downloadFullTable() {
        const universalBOM = "\uFEFF";
        const encodedUri = encodeURI(universalBOM + model.sunBurstTableAllData[graphState]);

        // creates a temporary link for exporting the table
        const fileName = Translation.translate(`lowerGraph.allDataCSVFileName.${graphState}`, { nutrient })
        const link = document.createElement('a');
        link.setAttribute('href', "data:text/csv;charset=utf-8," + encodedUri);
        link.setAttribute('download', `${fileName}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // scrollToNutrientSelection(): scrolls smoothly to the nutrient selection at the top of the bar graph
    function scrollToNutrientSelection() {
        const nutrientSelect = document.querySelector("#upperGraphNutrientSelect");
        const nutrientSelectTopPos = nutrientSelect.getBoundingClientRect().top + document.documentElement.scrollTop;
        const nutrientSelectTopMargin = 20;
        window.scrollTo({top: Math.max(nutrientSelectTopPos - nutrientSelectTopMargin, 0), behavior: 'smooth'});
    }
}