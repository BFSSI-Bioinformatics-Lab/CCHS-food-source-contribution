/////////////////////////////////////////////////////////////////////////
//                                                                     //
// Purpose: Handles the display of the bar graph and all its related   //
//     visuals                                                         //
//                                                                     //
// What it Contains:                                                   //
//      - drawing the bar graph                                        //
//      - drawing the table for the bar graph                          //
//      - drawing the bar graph legend                                 //
//      - drawing the tool tips for the bar graph                      //
//      - drawing the info box for the bar graph                       //
//                                                                     //
// NOTE:                                                               //
//      - Visualizations in UI code will not be abstracted so that     //
//          the visuals can be copy and pasted                         //
//      - We use nested functions to not get confused with state       //
//          information in class attributes and to not pass in many    //
//          arguments to functions                                     //
/////////////////////////////////////////////////////////////////////////



import { Colours, GraphColours, GraphDims, TextWrap, FoodGroupDescDataColNames, FontWeight, MousePointer, TranslationTools, DefaultDims} from "../assets/assets.js";
import { Visuals } from "./visuals.js";
import { Model } from "../backend/backend.js";



export function upperGraph(model){
    // all of the tooltips for the graph
    let hoverToolTips = {};

    // which food group is being focused in the bar graph
    let focusedFoodGroup = null;

    // which food group the mouse is over
    let mouseOverFoodGroupName = null;

    // nutrient selected
    let nutrient = "";

    // the grouped sums for each food group
    let groupedAmount = {};

    // the text for the ticks on the x-axis
    let xAxisTicks = null;

    // whether to display numbers/percentae for the graph
    /* Sets up alternator between graph types (percentage vs number) */
    const typeIterator = getGraphType();
    let graphType = typeIterator.next().value;

    const upperGraphSvgWidth = GraphDims.upperGraphWidth + GraphDims.upperGraphLeft + GraphDims.upperGraphRight;
    const upperGraphSvgHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop + GraphDims.upperGraphBottom;
    const upperGraphRightPos = GraphDims.upperGraphLeft + GraphDims.upperGraphWidth + GraphDims.upperGraphInfoBoxLeftMargin;

    // register the button to save the bar graph as a png
    d3.select("#upperGraphSaveGraph").on("click", () => saveAsImage());

    /* Create svg component */
    const upperGraphSvg = d3.select("#upperGraph")
        .append("svg")
            .attr("width", upperGraphSvgWidth)
            .attr("height", upperGraphSvgHeight)
            .attr("viewBox", [0, 0, upperGraphSvgWidth, upperGraphSvgHeight])
            .attr("style", "max-width: 100%; height: auto;");

    // create the background for the graph
    const upperGraphSvgBackground = upperGraphSvg.append("rect")
        .attr("fill", Colours.None)
        .attr("width", upperGraphSvgWidth)
        .attr("height", upperGraphSvgHeight)

    const upperGraphHeading = upperGraphSvg.append("g")
        .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", GraphDims.upperGraphChartHeadingFontSize)
            .attr("x", GraphDims.upperGraphLeft + GraphDims.upperGraphWidth / 2)
            .attr("y", GraphDims.upperGraphTop - GraphDims.upperGraphChartHeadingFontSize * 1.25)

    const upperGraphBars = upperGraphSvg.append("g")
    .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`)

    const upperGraphAxes = upperGraphSvg.append("g");

    const upperGraphXAxis = upperGraphAxes.append("g");
    const upperGraphXAxisLine = upperGraphXAxis.append("g")
        .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop + GraphDims.upperGraphHeight})`);
        
    const upperGraphXAxisScale = d3.scaleBand()
        .range([0, GraphDims.upperGraphWidth])
    const upperGraphXAxisLabel = upperGraphXAxis.append("text");

    const upperGraphYAxis = upperGraphAxes.append("g")
    const upperGraphYAxisLine = upperGraphYAxis.append("g")
        .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop})`);

    const upperGraphYAxisLabel = upperGraphYAxis.append("text").attr("font-size", GraphDims.upperGraphAxesFontSize)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("y", GraphDims.upperGraphLeft / 4)
        .attr("x", -(GraphDims.upperGraphTop + GraphDims.upperGraphHeight / 2));
        
    const upperGraphYAxisScale = d3.scaleLinear()
        .range([GraphDims.upperGraphHeight, 0]);

    const upperGraphTable = d3.select("#upperGraphTable");

    // remove any dummy tables that says "no data available in table" produced by JQuery
    upperGraphTable.selectAll("thead").remove();
    upperGraphTable.selectAll("tbody").remove();

    const upperGraphTableHeading = upperGraphTable.append("thead");
    const upperGraphTableBody = upperGraphTable.append("tbody");
    const upperGraphTableTitle = d3.select("#upperGraphTableTitle");

    const upperGraphSwitchTypeButton = d3.select("#upperGraphSwitchType");
    
    // --------------- draws the info box ---------------------
    
    // attributes for the info box
    const infoBox = {};
    let infoBoxHeight = GraphDims.upperGraphInfoBoxHeight;
    const infoBoxBorderWidth = GraphDims.upperGraphInfoBoxBorderWidth;
    const infoBoxPadding = Visuals.getPadding(GraphDims.upperGraphInfoBoxPadding);
    const infoBoxDims = Visuals.getComponentLengths(0, infoBoxHeight, infoBoxPadding);

    // group for the info box
    infoBox.group = upperGraphSvg.append("g")
        .attr("transform", `translate(${upperGraphRightPos}, ${GraphDims.upperGraphTop + GraphDims.upperGraphHeight - GraphDims.upperGraphInfoBoxHeight})`);

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
        .attr("font-size", GraphDims.upperGraphInfoBoxFontSize)
        .attr("transform", `translate(${infoBoxBorderWidth + infoBoxPadding.paddingLeft}, ${infoBoxPadding.paddingTop})`);
    
    // draw the text
    const textDims = Visuals.drawText({textGroup: infoBox.textGroup, fontSize: GraphDims.upperGraphInfoBoxFontSize, 
                                       lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing, padding: infoBoxPadding});

    // update the height of the info box to be larger than the height of the text
    infoBoxHeight = Math.max(infoBoxDims.height, textDims.textBottomYPos + infoBoxPadding.paddingBottom);
    infoBox.highlight.attr("y2", infoBoxHeight);

    const upperGraphInfoBox = infoBox;

    // --------------------------------------------------------

    /* Draw colour legend */
    drawGraphLegend(GraphColours, upperGraphRightPos);

    const upperGraphTooltips = upperGraphSvg.append("g");
    const upperGraphBarHoverDetect = upperGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`);

    return (nutrient) => {updateGraph(nutrient)};


    /* This generator function is used to set the value for the "graphType" and "type" variable */
    function *getGraphType(){
        while(true){
            yield "number";
            yield "percentage";
        }
    }

    /* Update bar graph given a specific nutrient */
    async function updateGraph(){
        // get the updated data for the graph
        nutrient = model.nutrient;
        const nutrientData = model.graphNutrientTablesByDemoGroupLv1[nutrient];

        const xAxisValues = Model.ageSexGroupHeadings;
        upperGraphXAxisScale.domain(xAxisValues);
        upperGraphXAxisLine.call(d3.axisBottom(upperGraphXAxisScale));

        xAxisTicks = upperGraphXAxisLine.selectAll(".tick").attr("font-size", GraphDims.upperGraphXAxisTickFontSize);

        const nutrientTotalByAgeSexGroup = Model.findNutrientTotalAmtPerAgeSexGroup(nutrientData, graphType);
        groupedAmount = nutrientTotalByAgeSexGroup.groupedAmount;
        const maxAccumulatedAmount = nutrientTotalByAgeSexGroup.maxAccumulatedAmount;

        upperGraphYAxisScale.domain([0, graphType === "number" ? Math.round(maxAccumulatedAmount * 1.2 / 10) * 10 : 100])
        upperGraphYAxisLine.call(d3.axisLeft(upperGraphYAxisScale));
        upperGraphYAxisLabel.text(TranslationTools.translateText(`upperGraph.${graphType}.yAxisTitle`, { nutrient, amountUnit: getNutrientUnit(nutrient) }));

        const yAxisTicks = upperGraphYAxisLine.selectAll(".tick").attr("font-size", GraphDims.upperGraphYAxisTickFontSize);

        upperGraphBars.selectAll("g").remove();
        upperGraphBarHoverDetect.selectAll("g").remove();

        upperGraphTooltips.selectAll("g").remove();

        if (focusedFoodGroup !== null) {
            barOnClick(focusedFoodGroup);
        }

        upperGraphBars.selectAll("g")
            .data(Object.values(groupedAmount))
            .enter()
            .each(
                (d, i) => 
                    drawUpperGraphStackedBars(upperGraphBars, d, xAxisTicks.nodes()[i].getAttribute("transform"), (dt) => barOnClick(dt), i + 1
                )
            )

        // draw the graph title
        upperGraphHeading.text(TranslationTools.translateText(`upperGraph.${graphType}.graphTitle`, { nutrient, amountUnit: getNutrientUnit(nutrient)}))
            .attr("font-weight", FontWeight.Bold);

        //draw the table
        drawTable(nutrient);

        // switch type button
        upperGraphSwitchTypeButton.text(TranslationTools.translateText(`upperGraph.${graphType}.switchTypeButton`))
            .on("click", () => {
                /* Iterator returns either percentage or number */
                graphType = typeIterator.next().value;
                updateGraph(nutrient);
            });
    }

    // drawUpperGraphStackedBars(element, groups, transform, onClick, mult): Draws the stacked bars for the graph
    function drawUpperGraphStackedBars(element, groups, transform, onClick, mult) {
        const groupEntries = Object.entries(groups);
        //  sort the [food group, intake] pairs in decreasing order by intake
        groupEntries.sort((a, b) => b[1]- a[1]);
        let accumulatedHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop;

        groupEntries.forEach((d, i) => hoverTooltip(d, mult * 100 + i));

        element.append("g")
            .attr("transform", transform)
            .selectAll("rect")
            .data(groupEntries)
            .enter()
            .append("rect")
                .attr("width", 100)                                     
                .attr("height", (d, i) => 
                    GraphDims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]) + 
                    /* So that there arent gaps between bars due to rounding */
                    (i !== groupEntries.length - 1 ? 1 : 0)
                )
                .attr("x", -50)
                .attr("y", (d, i) => {
                    const scaledHeight = GraphDims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]);
                    accumulatedHeight -= scaledHeight;
                    return (accumulatedHeight) - 
                        /* So that there arent gaps between bars due to rounding */
                        (i !== groupEntries.length - 1 ? 1 : 0);
                })
                .attr("fill", d => GraphColours[d[0]]);
        
        accumulatedHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop;
        
        /* Since tool tips cover the bars, use another transparent layer on top of everything with the shape of the bars to detect hover positions */
        upperGraphBarHoverDetect.append("g")
            .attr("transform", transform)
            .selectAll("rect")
            .data(groupEntries)
            .enter()
            .append("rect")
                .attr("width", 100)                                     
                .attr("height", (d, i) => 
                    GraphDims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]) + 
                    /* So that there arent gaps between bars due to rounding */
                    (i !== groupEntries.length - 1 ? 1 : 0)
                )
                .attr("x", -50)
                .attr("y", (d, i) => {
                    const scaledHeight = GraphDims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]);
                    accumulatedHeight -= scaledHeight;
                    return (accumulatedHeight) - 
                        /* So that there arent gaps between bars due to rounding */
                        (i !== groupEntries.length - 1 ? 1 : 0);
                })
                .attr("fill-opacity", 0)
                .on("mouseover", (d, index, elements) => {onBarHover(d, mult * 100 + index, index, elements)})
                .on("mousemove", (d, index, elements) => onBarHover(d, mult * 100 + index, index, elements))
                .on("mouseenter", (d, index, elements) => onBarHover(d, mult * 100 + index, index, elements))
                .on("mouseleave", (d, index, elements) => onBarUnHover(d, mult * 100 + index, index, elements))
                .on("click", onClick);
    }

    // barOnClick(dt): Focus on a particular food group when a bar is clicked
    function barOnClick(dt) {
        /* Zooming in on a specific category */
        upperGraphTooltips.selectAll("g").remove();

        const category = dt[0];
        focusedFoodGroup = dt;

        const barData = Object.values(groupedAmount).map(g => {
            const obj = {};
            obj[category] = g[category];
            return obj;
        });

        // the commented line below scales the y-axis to be fit with the focused bars
        // this.upperGraphYAxisScale.domain([0, d3.max(Object.values(barData).map(b => b[category])) * 1.15]);
        upperGraphYAxisLine.call(d3.axisLeft(upperGraphYAxisScale));

        upperGraphBars.selectAll("g").remove();
        upperGraphBarHoverDetect.selectAll("g").remove();

        upperGraphBars.selectAll("g")
            .data(barData)
            .enter()
            .each(
                (d, i) => 
                    drawUpperGraphStackedBars(upperGraphBars, d, xAxisTicks.nodes()[i].getAttribute("transform"), 
                    () => {
                        focusedFoodGroup = null;
                        updateGraph();
                    }, i + 1)  
            )         
    }

    /* Set the opacity of the hovered bar's info to be 1 */
    function onBarHover(d, i, index, elements){
        updateInfoBox({name: d[0], d: d});

        const toolTipId = `barHover${i}`
        const mousePos = d3.mouse(upperGraphSvg.node());

        const toolTip = hoverToolTips[toolTipId];

        toolTip.group.attr("opacity", 1)
            .attr("transform", `translate(${mousePos[0]}, ${mousePos[1]})`);

        const bar = d3.select(elements[index]);
        bar.style("cursor", MousePointer.Pointer);
    }

    /* Set the opacity of the previously hovered bar's info to be 0 */
    function onBarUnHover(d, i, index, elements){
        hideInfoBox();
        d3.select(`#barHover${i}`).attr("opacity", 0).style("pointer-events", "none");

        const bar = d3.select(elements[index]);
        bar.style("cursor", MousePointer.Default);
    }

    function getNutrientUnit(nutrient){
        const nutrientData = model.graphNutrientTablesByDemoGroupLv1[nutrient];
        return Object.values(Object.values(nutrientData)[0])[0][0]["Unit"];
    }

    // drawTable(nutrient): Draws the table for the graph
    function drawTable(nutrient){
        const nutrientData = model.tableNutrientTablesByDemoGroupLv1[nutrient];
        const ageSexGroupHeadings = Model.ageSexGroupHeadings;
        const headingsPerSexAgeGroup = ["Amount (g)", "Amount SE", "% of total intake", "% SE"];
        const headingsPerSexAgeGroupKeys = ["Amount", "Amount_SE", "Percentage", "Percentage_SE"];

        const nutrientAgeGroups = Object.keys(nutrientData);
        const amountLeftIndex = 1;

        // --------------- draws the table -------------------------

        /* Create top-level heading */
        upperGraphTableHeading.selectAll("tr").remove();
        upperGraphTableHeading.append("tr")
            .selectAll("th")
            .data(["", ...ageSexGroupHeadings.filter(g => nutrientAgeGroups.includes(g))])
            .enter()
            .append("th")
                .attr("class", "text-center")
                .style("border-left", (d, i) => i === 0 ? "" : GraphDims.tableSectionBorderLeft)
                .style("border-bottom", (d, i) => i === 0 ? "0px" : GraphDims.tableSectionBorderLeft)
                .style("font-size", `${GraphDims.upperGraphTableHeadingFontSize}px`)
                .attr("colspan", (d, i) => i === 0 ? 1 : headingsPerSexAgeGroup.length)
                .text(d => TranslationTools.translateText(d));

        /* Create subheading columns */
        const subHeadingColumns = Object.keys(nutrientData).map(() => headingsPerSexAgeGroup).flat();
        upperGraphTableHeading.append("tr")
            .selectAll("td")
            .data([""].concat(subHeadingColumns))
            .enter()
            .append("td")
                .style("min-width", (d, i) => i === 0 ? "200px" : "40px")
                .style("border-left", (d, i) => (i + 1) % 4 === 2 ? GraphDims.tableSectionBorderLeft : "")
                .style("border-top", "0px")
                .style("font-size", `${GraphDims.upperGraphTableSubHeadingFontSize}px`)
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
                .text(d => TranslationTools.translateText(d))
        
        upperGraphTableBody.selectAll("tr").remove();
        const tableRows = {};
        /* Create rows */
        Object.entries(nutrientData).map((entry) => {
            const [ageSexGroup, foodLevelGroup] = entry;            
            Object.entries(foodLevelGroup).map(foodLevelGroupEntry => {
                const [foodLevelName, foodLevelGroupData] = foodLevelGroupEntry;
                const foodLevelRowData = (tableRows[foodLevelName] ?? []);
                foodLevelRowData.splice(
                    ageSexGroupHeadings.indexOf(ageSexGroup), 
                    0, 
                    foodLevelGroupData.find(d => !d["Food group_level2"] && !d["Food group_level3"])
                )
                tableRows[foodLevelName] = foodLevelRowData;
            })
        })

        Object.entries(tableRows).forEach(([foodLevelGroup, d]) => {
            const newRow = upperGraphTableBody.append("tr")
                .selectAll("td")
                .data([foodLevelGroup].concat(d.map(g => headingsPerSexAgeGroupKeys.map(key => Number.isNaN(g[key]) ? Model.getInterpretationValue(g["Interpretation_Notes"]) : g[key])).flat()))
                .enter()
                .append("td")
                    .attr("colspan", 1)
                    .text((d) => Number.isNaN(d) ? "" : d)
                    .attr("class", (d, i) => i !== 0 ? "brdr-lft" : "")
                    .style("border-left", (d, i) => (i + 1) % 4 === 2 ? GraphDims.tableSectionBorderLeft : "")
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
        });

        upperGraphTableTitle.text(TranslationTools.translateText("upperGraph.tableTitle", { amountUnit: getNutrientUnit(nutrient), nutrient }))

        // ---------------------------------------------------------
    }

    // showInfoBox(name, colour, legendItem): Shows the info box
    function showInfoBox({name = "", colour = Colours.None, legendItem = null} = {}) {
        updateInfoBox({name: name, colour: colour});
        legendItem.group.   style("cursor", MousePointer.Pointer);
    }

    // hideInfoBox(): Hides the food group description box
    function hideInfoBox() {
        mouseOverFoodGroupName = null;

        upperGraphInfoBox.highlight.attr("stroke", Colours.None);
        Visuals.drawWrappedText({textGroup: upperGraphInfoBox.textGroup});
    }

    // legendItemOnMouseLeave(name, colour, legendItem): Event function when the user's mouse leaves a key
    //  in the legend
    function legendItemOnMouseLeave({name = "", colour = Colours.None, legendItem = null}) {
        hideInfoBox();
        legendItem.group.style("cursor", MousePointer.Default);
    }

    // legendItemOnClick(name, colour): Event function when the user clicks on a key in the legend
    function legendItemOnClick({name = "", colour = Colours.None} = {}) {
        let newFocusedFoodGroup = null;
        if (focusedFoodGroup === null || name != focusedFoodGroup[0]) {
            newFocusedFoodGroup = [name, 0];
        }

        focusedFoodGroup = newFocusedFoodGroup;

        if (newFocusedFoodGroup !== null) {
            barOnClick(newFocusedFoodGroup);
        } else {
            updateGraph(nutrient);
        }
    }

    // Update food group description box
    function updateInfoBox({name = "", colour = Colours.None, amount = 0} = {}){
        const foodGroupName = name;
        if (mouseOverFoodGroupName !== null && mouseOverFoodGroupName == foodGroupName) {
            return;
        }

        mouseOverFoodGroupName = foodGroupName;
        const desc = model.getFoodDescription(nutrient, foodGroupName);

        // ---------- Updates the infobox --------------

        const infoBoxPadding = Visuals.getPadding(GraphDims.upperGraphInfoBoxPadding);

        // change text
        const textDims = Visuals.drawText({textGroup: upperGraphInfoBox.textGroup, text: desc, width: GraphDims.upperGraphInfoBoxWidth, 
                                           fontSize: GraphDims.upperGraphInfoBoxFontSize, lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing, padding: infoBoxPadding});

        // change colour
        upperGraphInfoBox.highlight.attr("stroke", GraphColours[foodGroupName]);

        // update the height of the info box to be larger than the height of the text
        let infoBoxHeight = upperGraphInfoBox.highlight.node().getBBox()["height"];
        infoBoxHeight = Math.max(infoBoxHeight, infoBoxPadding.paddingTop + textDims.textBottomYPos + infoBoxPadding.paddingBottom);
        upperGraphInfoBox.highlight.attr("y2", infoBoxHeight);

        // ---------------------------------------------
    }


    // drawGraphLegend(titleToColours, upperGraphRightPos): Draws the legend
    function drawGraphLegend(titleToColours, upperGraphRightPos){

        // ----------------- draws the legend ---------------------
        
        // attributes for the legend
        const legendItemPadding = Visuals.getPadding([0, 2]);
        const legendItemTextPadding = Visuals.getPadding([5, 0]);
        const legendItemFontSize = 12;
        const legendData = Object.entries(titleToColours).filter(nameColourKVP => nameColourKVP[0] != "All Items");
        const colourBoxWidth = GraphDims.legendSquareSize;
        const colourBoxHeight = GraphDims.legendSquareSize;
        const legendItems = [];
        let currentLegendItemYPos = 0;
        
        // draw the container to hold the legend
        const legendGroup = upperGraphSvg.append("g")
            .attr("transform", `translate(${upperGraphRightPos}, ${GraphDims.upperGraphTop})`);

        // draw all the keys for the legend
        for (const legendKey of legendData) {
            let legendKeyText = legendKey[0];
            let legendKeyColour = legendKey[1];

            // ***************** draws a key in the legend *********************
            
            const legendItemGroup = legendGroup.append("g")
            .attr("transform", `translate(0, ${currentLegendItemYPos})`);
    
            // draw the coloured box
            const colourBox = legendItemGroup.append("rect")
                .attr("y", legendItemPadding.paddingTop)
                .attr("x", legendItemPadding.paddingLeft)
                .attr("width", colourBoxWidth)
                .attr("height", colourBoxHeight)
                .attr("fill", legendKeyColour);
    
            // draw the text
            const textX = legendItemPadding.paddingLeft + colourBoxWidth + legendItemTextPadding.paddingLeft;
            const textY = legendItemTextPadding.paddingTop;
            const textGroup = legendItemGroup.append("text")
                .attr("y", legendItemPadding.paddingTop)
                .attr("x", textX)
                .attr("font-size", legendItemFontSize);
    
            Visuals.drawText({textGroup, fontSize: legendItemFontSize, textWrap: TextWrap.NoWrap, text: legendKeyText, textX, textY});

            const legendItem = {group: legendItemGroup, colourBox, textGroup, name: legendKeyText, colour: legendKeyColour};

            // *****************************************************************

            currentLegendItemYPos += legendItemPadding.paddingTop + legendItemPadding.paddingBottom + legendItemGroup.node().getBBox()["height"];
            legendItems.push(legendItem);
        }

        // --------------------------------------------------------

        // add the mouse events to the keys of the legend
        for (const legendItem of legendItems) {
            const name = legendItem.name;
            const colour = legendItem.colour;
            const legendItemGroup = legendItem.group;

            legendItemGroup.on("mouseenter", () => { showInfoBox({name, colour, legendItem}); });
            legendItemGroup.on("mouseleave", () => { legendItemOnMouseLeave({name, colour, legendItem}); });
            legendItemGroup.on("click", () => { legendItemOnClick({name, colour, legendItem}); });
            legendItemGroup.on("mouseover", () => { showInfoBox({name, colour, legendItem}); });
        }
    }


    /* Creates tooltip for hovering over bars */
    function hoverTooltip(d, i){
        const toolTipId = `barHover${i}`;
        const colour = GraphColours[d[0]];
        const lines = TranslationTools.translateText("upperGraph.infoBox", { 
            returnObjects: true, 
            context: graphType,
            amount: parseFloat(d[1]).toFixed(1),
            name: d[0],
            percentage: parseFloat(d[1]).toFixed(1),
            nutrient: d[0]
        });
        
        // ------- draw the tooltip ------------

        // attributes for the tool tip
        const toolTip = {};
        let toolTipWidth = GraphDims.upperGraphTooltipMinWidth;
        let toolTipHeight = 50;
        const toolTipBorderWidth = 3;
        const toolTipBackgroundColor = Colours.White;
        const toolTipPadding = Visuals.getPadding([GraphDims.upperGraphTooltipLeftPadding, GraphDims.upperGraphTooltipTopPadding]);
        const toolTipTextPadding = Visuals.getPadding([GraphDims.upperGraphTooltipTextPaddingHor, GraphDims.upperGraphTooltipTextPaddingVert]);
        const toolTipDims = Visuals.getComponentLengths(toolTipWidth, toolTipHeight, toolTipPadding);
        const toolTipHighlightXPos = toolTipPadding.paddingLeft + toolTipBorderWidth / 2;

        // draw the container for the tooltip
        toolTip.group = upperGraphTooltips.append("g")
            .attr("id",  toolTipId)
            .attr("opacity", 0);

        // draw the background for the tooltip
        toolTip.background = toolTip.group.append("rect")
            .attr("height", toolTipHeight)
            .attr("width", toolTipWidth)
            .attr("fill", toolTipBackgroundColor)
            .attr("stroke", colour)
            .attr("stroke-width", 1)
            .attr("rx", 5);

        // draw the highlight
        toolTip.highlight = toolTip.group.append("line")
            .attr("x1", toolTipHighlightXPos)
            .attr("x2", toolTipHighlightXPos)
            .attr("y1", toolTipPadding.paddingTop)
            .attr("y2", toolTipHeight - toolTipPadding.paddingBottom)
            .attr("stroke", colour) 
            .attr("stroke-width", toolTipBorderWidth)
            .attr("stroke-linecap", "round");

        // draw the text
        toolTip.textGroup = toolTip.group.append("text")
            .attr("font-size", GraphDims.upperGraphTooltipFontSize)
            .attr("transform", `translate(${toolTipBorderWidth + toolTipPadding.paddingLeft +  toolTipTextPadding.paddingLeft}, ${toolTipPadding.paddingTop + toolTipTextPadding.paddingTop})`);

        const textDims = Visuals.drawText({textGroup: toolTip.textGroup, text: lines, width: toolTipDims.width, fontSize: GraphDims.upperGraphTooltipFontSize, 
                                           lineSpacing: GraphDims.upperGraphTooltipLineSpacing, textWrap: TextWrap.NoWrap, padding: toolTipPadding});

        // update the height of the tooltip to be larger than the height of all the text
        toolTipHeight = Math.max(toolTipHeight, toolTipPadding.paddingTop + toolTipTextPadding.paddingTop + textDims.textBottomYPos + toolTipTextPadding.paddingTop + toolTipPadding.paddingBottom);
        toolTip.background.attr("height", toolTipHeight);
        toolTip.highlight.attr("y2", toolTipHeight - toolTipPadding.paddingBottom - toolTipPadding.paddingTop);

        // update the width of the tooltip to be larger than the width of all the text
        toolTipWidth = Math.max(toolTipWidth, toolTipPadding.paddingLeft + toolTipBorderWidth + toolTipTextPadding.paddingLeft + textDims.width + toolTipTextPadding.paddingRight + toolTipPadding.paddingRight);
        toolTip.background.attr("width", toolTipWidth);

        // -------------------------------------
        
        hoverToolTips[toolTipId] = toolTip;
        return toolTip;
    }


    // saveAsImage(): Saves the bar graph as an image
    function saveAsImage() {
        const svg = document.getElementById("upperGraph").firstChild;
        saveSvgAsPng(svg, "BarGraph.png", {backgroundColor: "white"});
    }
}



export class BarGraph {
    constructor({model = null} = {}) {
        this.model = model;

        // === Data retrieves from the model ===
        this.nutrient = "";
        this.foodGroupDescriptions = this.model.foodGroupDescriptionData;

        // =====================================


        this.groupedAmount = {};
        
        this.focusedFoodGroup = null;
        this.mouseOverFoodGroupName = null;
        this.hoverToolTips = {};

        // whether to display numbers/percentae for the graph
        this.graphType = "";
        this.typeIterator = this.getGraphType();

        // === different individual elements for the component ===
        this.upperGraphSvg = null;
        this.upperGraphSvgBackground = null;
        this.upperGraphBars = null;
        this.upperGraphHeading = null;
        this.upperGraphTooltips = null;
        this.upperGraphBarHoverDetect = null;
        this.upperGraphSwitchTypeButton = null;

        this.upperGraphYAxisScale = null;
        this.upperGraphYAxisLabel = null;
        this.upperGraphXAxisLine = null;
        this.xAxisTicks = null;
        this.yAxisTicks = null;
        this.upperGraphInfoBox = null;

        // table for the graph
        this.upperGraphTableHeading = null;
        this.upperGraphTableBody = null;
        this.upperGraphTableTitle = null;

        // =======================================================
    }

    // getToolTipId(num): Retrieves the key id for a particular id
    getToolTipId(num) {
        return `barHover${num}`
    }

    /* This generator function is used to set the value for the "graphType" and "type" variable */
    *getGraphType(){
        while(true){
            yield "number";
            yield "percentage";
        }
    }

    getNutrientUnit(nutrient){
        const nutrientData = this.model.graphNutrientTablesByDemoGroupLv1[nutrient];
        return Object.values(Object.values(nutrientData)[0])[0][0]["Unit"];
    }

    // hideInfoBox(): Hides the food group description box
    hideInfoBox() {
        this.mouseOverFoodGroupName = null;

        this.upperGraphInfoBox.highlight.attr("stroke", Colours.None);
        Visuals.drawWrappedText({textGroup: this.upperGraphInfoBox.textGroup});


    }

    // showInfoBox(name, colour, legendItem): Shows the info box
    showInfoBox({name = "", colour = Colours.None, legendItem = null} = {}) {
        this.updateInfoBox({name: name, colour: colour});
        legendItem.group.style("cursor", MousePointer.Pointer);
    }

    // Update food group description box
    updateInfoBox({name = "", colour = Colours.None, amount = 0} = {}){
        const foodGroupName = name;
        if (this.mouseOverFoodGroupName !== null && this.mouseOverFoodGroupName == foodGroupName) {
            return;
        }

        this.mouseOverFoodGroupName = foodGroupName;
        const desc = this.model.getFoodDescription(this.nutrient, foodGroupName);

        // ---------- Updates the infobox --------------

        const infoBoxPadding = Visuals.getPadding(GraphDims.upperGraphInfoBoxPadding);

        // change text
        const textDims = Visuals.drawText({textGroup: this.upperGraphInfoBox.textGroup, text: desc, width: GraphDims.upperGraphInfoBoxWidth, 
                                           fontSize: GraphDims.upperGraphInfoBoxFontSize, lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing, padding: infoBoxPadding});

        // change colour
        this.upperGraphInfoBox.highlight.attr("stroke", GraphColours[foodGroupName]);

        // update the height of the info box to be larger than the height of the text
        let infoBoxHeight = this.upperGraphInfoBox.highlight.node().getBBox()["height"];
        infoBoxHeight = Math.max(infoBoxHeight, infoBoxPadding.paddingTop + textDims.textBottomYPos + infoBoxPadding.paddingBottom);
        this.upperGraphInfoBox.highlight.attr("y2", infoBoxHeight);

        // ---------------------------------------------
    }

    /* Set the opacity of the hovered bar's info to be 1 */
    onBarHover(d, i, index, elements){
        this.updateInfoBox({name: d[0], d: d});

        const toolTipId = this.getToolTipId(i);
        const mousePos = d3.mouse(this.upperGraphSvg.node());

        const toolTip = this.hoverToolTips[toolTipId];

        toolTip.group.attr("opacity", 1)
            .attr("transform", `translate(${mousePos[0]}, ${mousePos[1]})`);

        const bar = d3.select(elements[index]);
        bar.style("cursor", MousePointer.Pointer);
    }

    /* Set the opacity of the previously hovered bar's info to be 0 */
    onBarUnHover(d, i, index, elements){
        this.hideInfoBox();
        d3.select(`#barHover${i}`).attr("opacity", 0).style("pointer-events", "none");

        const bar = d3.select(elements[index]);
        bar.style("cursor", MousePointer.Default);
    }

    // barOnClick(dt): Focus on a particular food group when a bar is clicked
    barOnClick(dt) {
        /* Zooming in on a specific category */
        this.upperGraphTooltips.selectAll("g").remove();

        const category = dt[0];
        this.focusedFoodGroup = dt;

        const barData = Object.values(this.groupedAmount).map(g => {
            const obj = {};
            obj[category] = g[category];
            return obj;
        });

        // the commented line below scales the y-axis to be fit with the focused bars
        // this.upperGraphYAxisScale.domain([0, d3.max(Object.values(barData).map(b => b[category])) * 1.15]);
        this.upperGraphYAxisLine.call(d3.axisLeft(this.upperGraphYAxisScale));

        this.upperGraphBars.selectAll("g").remove();
        this.upperGraphBarHoverDetect.selectAll("g").remove();

        this.upperGraphBars.selectAll("g")
            .data(barData)
            .enter()
            .each(
                (d, i) => 
                    this.drawUpperGraphStackedBars(this.upperGraphBars, d, this.xAxisTicks.nodes()[i].getAttribute("transform"), 
                    () => {
                        this.focusedFoodGroup = null;
                        this.updateGraph(this.nutrient);
                    }, i + 1)  
            )         
    }

    draw() {
        return this.upperGraph();
    }

    // legendItemOnClick(name, colour): Event function when the user clicks on a key in the legend
    legendItemOnClick({name = "", colour = Colours.None} = {}) {
        let focusedFoodGroup = null;
        if (this.focusedFoodGroup === null || name != this.focusedFoodGroup[0]) {
            focusedFoodGroup = [name, 0];
        }

        this.focusedFoodGroup = focusedFoodGroup;

        if (focusedFoodGroup !== null) {
            this.barOnClick(focusedFoodGroup);
        } else {
            this.updateGraph(this.nutrient);
        }
    }

    // legendItemOnMouseLeave(name, colour, legendItem): Event function when the user's mouse leaves a key
    //  in the legend
    legendItemOnMouseLeave({name = "", colour = Colours.None, legendItem = null}) {
        this.hideInfoBox();
        legendItem.group.style("cursor", MousePointer.Default);
    }

    // drawGraphLegend(titleToColours, upperGraphRightPos): Draws the legend
    drawGraphLegend(titleToColours, upperGraphRightPos){

        // ----------------- draws the legend ---------------------
        
        // attributes for the legend
        const legendItemPadding = Visuals.getPadding([0, 2]);
        const legendItemTextPadding = Visuals.getPadding([5, 0]);
        const legendItemFontSize = 12;
        const legendData = Object.entries(titleToColours).filter(nameColourKVP => nameColourKVP[0] != "All Items");
        const colourBoxWidth = GraphDims.legendSquareSize;
        const colourBoxHeight = GraphDims.legendSquareSize;
        const legendItems = [];
        let currentLegendItemYPos = 0;
        
        // draw the container to hold the legend
        const legendGroup = this.upperGraphSvg.append("g")
            .attr("transform", `translate(${upperGraphRightPos}, ${GraphDims.upperGraphTop})`);

        // draw all the keys for the legend
        for (const legendKey of legendData) {
            let legendKeyText = legendKey[0];
            let legendKeyColour = legendKey[1];

            // ***************** draws a key in the legend *********************
            
            const legendItemGroup = legendGroup.append("g")
            .attr("transform", `translate(0, ${currentLegendItemYPos})`);
    
            // draw the coloured box
            const colourBox = legendItemGroup.append("rect")
                .attr("y", legendItemPadding.paddingTop)
                .attr("x", legendItemPadding.paddingLeft)
                .attr("width", colourBoxWidth)
                .attr("height", colourBoxHeight)
                .attr("fill", legendKeyColour);
    
            // draw the text
            const textX = legendItemPadding.paddingLeft + colourBoxWidth + legendItemTextPadding.paddingLeft;
            const textY = legendItemTextPadding.paddingTop;
            const textGroup = legendItemGroup.append("text")
                .attr("y", legendItemPadding.paddingTop)
                .attr("x", textX)
                .attr("font-size", legendItemFontSize);
    
            Visuals.drawText({textGroup, fontSize: legendItemFontSize, textWrap: TextWrap.NoWrap, text: legendKeyText, textX, textY});

            const legendItem = {group: legendItemGroup, colourBox, textGroup, name: legendKeyText, colour: legendKeyColour};

            // *****************************************************************

            currentLegendItemYPos += legendItemPadding.paddingTop + legendItemPadding.paddingBottom + legendItemGroup.node().getBBox()["height"];
            legendItems.push(legendItem);
        }

        // --------------------------------------------------------

        // add the mouse events to the keys of the legend
        for (const legendItem of legendItems) {
            const name = legendItem.name;
            const colour = legendItem.colour;
            const legendItemGroup = legendItem.group;

            legendItemGroup.on("mouseenter", () => { this.showInfoBox({name, colour, legendItem}); });
            legendItemGroup.on("mouseleave", () => { this.legendItemOnMouseLeave({name, colour, legendItem}); });
            legendItemGroup.on("click", () => { this.legendItemOnClick({name, colour, legendItem}); });
            legendItemGroup.on("mouseover", () => { this.showInfoBox({name, colour, legendItem}); });
        }
    }

    // drawTable(nutrient): Draws the table for the graph
    drawTable(nutrient){
        const nutrientData = this.model.tableNutrientTablesByDemoGroupLv1[nutrient];
        const ageSexGroupHeadings = Model.ageSexGroupHeadings;
        const headingsPerSexAgeGroup = ["Amount (g)", "Amount SE", "% of total intake", "% SE"];
        const headingsPerSexAgeGroupKeys = ["Amount", "Amount_SE", "Percentage", "Percentage_SE"];

        const nutrientAgeGroups = Object.keys(nutrientData);
        const amountLeftIndex = 1;

        // --------------- draws the table -------------------------

        /* Create top-level heading */
        this.upperGraphTableHeading.selectAll("tr").remove();
        this.upperGraphTableHeading.append("tr")
            .selectAll("th")
            .data(["", ...ageSexGroupHeadings.filter(g => nutrientAgeGroups.includes(g))])
            .enter()
            .append("th")
                .attr("class", "text-center")
                .style("border-left", (d, i) => i === 0 ? "" : GraphDims.tableSectionBorderLeft)
                .style("border-bottom", (d, i) => i === 0 ? "0px" : GraphDims.tableSectionBorderLeft)
                .style("font-size", `${GraphDims.upperGraphTableHeadingFontSize}px`)
                .attr("colspan", (d, i) => i === 0 ? 1 : headingsPerSexAgeGroup.length)
                .text(d => TranslationTools.translateText(d));

        /* Create subheading columns */
        const subHeadingColumns = Object.keys(nutrientData).map(() => headingsPerSexAgeGroup).flat();
        this.upperGraphTableHeading.append("tr")
            .selectAll("td")
            .data([""].concat(subHeadingColumns))
            .enter()
            .append("td")
                .style("min-width", (d, i) => i === 0 ? "200px" : "40px")
                .style("border-left", (d, i) => (i + 1) % 4 === 2 ? GraphDims.tableSectionBorderLeft : "")
                .style("border-top", "0px")
                .style("font-size", `${GraphDims.upperGraphTableSubHeadingFontSize}px`)
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
                .text(d => TranslationTools.translateText(d))
        
        this.upperGraphTableBody.selectAll("tr").remove();
        const tableRows = {};
        /* Create rows */
        Object.entries(nutrientData).map((entry) => {
            const [ageSexGroup, foodLevelGroup] = entry;            
            Object.entries(foodLevelGroup).map(foodLevelGroupEntry => {
                const [foodLevelName, foodLevelGroupData] = foodLevelGroupEntry;
                const foodLevelRowData = (tableRows[foodLevelName] ?? []);
                foodLevelRowData.splice(
                    ageSexGroupHeadings.indexOf(ageSexGroup), 
                    0, 
                    foodLevelGroupData.find(d => !d["Food group_level2"] && !d["Food group_level3"])
                )
                tableRows[foodLevelName] = foodLevelRowData;
            })
        })

        Object.entries(tableRows).forEach(([foodLevelGroup, d]) => {
            const newRow = this.upperGraphTableBody.append("tr")
                .selectAll("td")
                .data([foodLevelGroup].concat(d.map(g => headingsPerSexAgeGroupKeys.map(key => Number.isNaN(g[key]) ? Model.getInterpretationValue(g["Interpretation_Notes"]) : g[key])).flat()))
                .enter()
                .append("td")
                    .attr("colspan", 1)
                    .text((d) => Number.isNaN(d) ? "" : d)
                    .attr("class", (d, i) => i !== 0 ? "brdr-lft" : "")
                    .style("border-left", (d, i) => (i + 1) % 4 === 2 ? GraphDims.tableSectionBorderLeft : "")
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
        });

        this.upperGraphTableTitle.text(TranslationTools.translateText("upperGraph.tableTitle", { amountUnit: this.getNutrientUnit(nutrient), nutrient }))

        // ---------------------------------------------------------
    }

    // saveAsImage(): Saves the bar graph as an image
    saveAsImage() {
        const svg = document.getElementById("upperGraph").firstChild;
        saveSvgAsPng(svg, "BarGraph.png", {backgroundColor: "white"});
    }
}

