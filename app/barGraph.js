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



import { Colours, GraphColours, GraphDims, TextWrap, FontWeight, MousePointer, Translation, SortIconClasses, SortStates } from "./assets.js";
import { drawWrappedText, drawText } from "./visuals.js";


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

    // unit for the nutrient
    let nutrientUnit = "";

    // titles for the graph and table
    let graphTitleText = ""
    let tableTitleText = ""

    // table column that is being sorted
    let sortedColIndex = null;
    let sortedColState = SortStates.Unsorted;

    // whether to display numbers/percentae for the graph
    /* Sets up alternator between graph types (percentage vs number) */
    const typeIterator = getGraphType();
    let graphType = typeIterator.next().value;

    const upperGraphSvgWidth = GraphDims.upperGraphWidth + GraphDims.upperGraphLeft + GraphDims.upperGraphRight;
    const upperGraphSvgHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop + GraphDims.upperGraphBottom + GraphDims.upperGraphFooter;
    const upperGraphRightPos = GraphDims.upperGraphLeft + GraphDims.upperGraphWidth + GraphDims.upperGraphInfoBoxLeftMargin;

    // register the button to save the bar graph as a png
    d3.select("#upperGraphSaveGraph").on("click", () => saveAsImage());

    // register the download table button
    const downloadButton = d3.select("#upperGraphSaveTable").on("click", () => downloadTable());

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

    // ------------ draw the footnotes for the graph -----------------

    const footNoteWidth = upperGraphSvgWidth - 2 * GraphDims.upperGraphFooterPaddingHor;

    const footNotesContainer = upperGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.upperGraphFooterPaddingHor}, ${GraphDims.upperGraphHeight + GraphDims.upperGraphTop + GraphDims.upperGraphBottom})`)
        .attr("visibility", "hidden");
    
    // foot note for excluding pregnancy and lactating
    const exclusionFootNoteTextBox = footNotesContainer.append("text")
        .attr("transform", `translate(${GraphDims.upperGraphFooterPaddingHor}, 0)`)
        .attr("font-size", GraphDims.upperGraphFooterFontSize);

    const exclusionFootNoteTextDims = drawText({textGroup: exclusionFootNoteTextBox, text: Translation.translate("FootNotes.excludePregnantAndLactating"), width: footNoteWidth, 
                                                fontSize: GraphDims.upperGraphFooterFontSize});

    // foot note for the source text
    const sourceTextBox = footNotesContainer.append("text")
        .attr("transform", `translate(${GraphDims.upperGraphFooterPaddingHor}, ${exclusionFootNoteTextDims.textBottomYPos + GraphDims.upperGraphFootNoteSpacing})`)
        .attr("font-size", GraphDims.upperGraphFooterFontSize);

    drawText({textGroup: sourceTextBox, text: Translation.translate("FootNotes.sourceText"), width: footNoteWidth, fontSize: GraphDims.upperGraphFooterFontSize});

    // -----------------------------------------------------------------

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
    const infoBoxTextGroupHeight = Math.max(infoBoxHeight, infoBoxHeight - 2 * GraphDims.upperGraphInfoBoxPadding);

    // group for the info box
    infoBox.group = upperGraphSvg.append("g")
        .attr("transform", `translate(${upperGraphRightPos}, ${GraphDims.upperGraphTop + GraphDims.upperGraphHeight - GraphDims.upperGraphInfoBoxHeight})`);

    // border line for the info box
    infoBox.highlight = infoBox.group.append("line")
        .attr("x1", GraphDims.upperGraphInfoBoxBorderWidth / 2)
        .attr("x2", GraphDims.upperGraphInfoBoxBorderWidth / 2)
        .attr("y2", infoBoxHeight)
        .attr("stroke-width", GraphDims.upperGraphInfoBoxBorderWidth)
        .attr("visibility", "visible")
        .attr("stroke-linecap", "round");

    // container to hold the title
    infoBox.titleGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.upperGraphInfoBoxTitleFontSize)
        .attr("font-weight", FontWeight.Bold);

    // container to hold the subtitle
    infoBox.subTitleGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.upperGraphInfoBoxFontSize)
        .attr("font-weight", FontWeight.Bold);

    // container to hold the text
    infoBox.textGroup = infoBox.group.append("text")
        .attr("font-size", GraphDims.upperGraphInfoBoxFontSize);

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

        // update unit for the nutrient
        nutrientUnit = model.getNutrientUnit();

        const xAxisValues = model.ageSexGroupHeadings;
        upperGraphXAxisScale.domain(xAxisValues);
        upperGraphXAxisLine.call(d3.axisBottom(upperGraphXAxisScale));

        xAxisTicks = upperGraphXAxisLine.selectAll(".tick").attr("font-size", GraphDims.upperGraphXAxisTickFontSize);

        const nutrientTotalByAgeSexGroup = model.findNutrientTotalAmtPerAgeSexGroup(graphType);
        groupedAmount = nutrientTotalByAgeSexGroup.groupedAmount;
        const maxAccumulatedAmount = nutrientTotalByAgeSexGroup.maxAccumulatedAmount;

        upperGraphYAxisScale.domain([0, graphType === "number" ? Math.round(maxAccumulatedAmount * 1.2 / 10) * 10 : 100])
        upperGraphYAxisLine.call(d3.axisLeft(upperGraphYAxisScale));
        upperGraphYAxisLabel.text(Translation.translate(`upperGraph.${graphType}.yAxisTitle`, { nutrient, amountUnit: nutrientUnit }));

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
        graphTitleText = Translation.translate(`upperGraph.${graphType}.graphTitle`, { nutrient, amountUnit: nutrientUnit});
        upperGraphHeading.text(graphTitleText).attr("font-weight", FontWeight.Bold);

        //draw the table
        drawTable(nutrient);

        // switch type button
        upperGraphSwitchTypeButton.text(Translation.translate(`upperGraph.${graphType}.switchTypeButton`))
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

    // drawTable(nutrient): Draws the table for the graph
    function drawTable(nutrient, reloadData = true){
        const barGraphTable = reloadData ? model.createBarGraphTable() : model.barGraphTable;
        const amountLeftIndex = 1;

        // --------------- draws the table -------------------------

        /* Create top-level heading */
        upperGraphTableHeading.selectAll("tr").remove();
        upperGraphTableHeading.append("tr")
            .selectAll("th")
            .data(barGraphTable.headings)
            .enter()
            .append("th")
                .attr("class", "text-center")
                .style("border-left", (d, i) => i === 0 ? "" : GraphDims.tableSectionBorderLeft)
                .style("border-bottom", (d, i) => i === 0 ? "0px" : GraphDims.tableSectionBorderLeft)
                .style("font-size", `${GraphDims.upperGraphTableHeadingFontSize}px`)
                .attr("colspan", (d, i) => i === 0 ? 1 : barGraphTable.headingsPerSexAgeGroup.length)
                .text(d => Translation.translate(d));

        /* Create subheading columns */
        upperGraphTableHeading.append("tr")
            .selectAll("td")
            .data(barGraphTable.subHeadings)
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
                .text(subHeadingData => Translation.translate(subHeadingData.heading))
                .on("click", (headingData) => { 
                    sortedColState = headingData.ind == sortedColIndex ? SortStates.getNext(sortedColState) : SortStates.Ascending; 
                    sortedColIndex = headingData.ind;
                    drawTable(nutrient, false);
                })
                .on("mouseenter", (headingData, ind, tableHeaders) => { tableHeaders[ind].style.cursor = MousePointer.Pointer; })
                .on("mouseleave", (headingData, ind, tableHeaders) => { tableHeaders[ind].style.cursor = MousePointer.Default; })

                // add in the sorting icon
                .append("i")
                .attr("class", (headingData) => { return `sortIcon ${sortedColIndex == headingData.ind ? SortIconClasses[sortedColState] : SortIconClasses[SortStates.Unsorted]}` })
                .attr("aria-hidden", true);

        // sort the table data
        let barGraphTableDataRows = barGraphTable.table;
        if (sortedColIndex !== null && sortedColState == SortStates.Ascending) {
            barGraphTableDataRows = barGraphTableDataRows.toSorted((row1, row2) => { return barGraphTable.compareFuncs[sortedColIndex](row1 [sortedColIndex], row2[sortedColIndex]) });
        } else if (sortedColIndex !== null && sortedColState == SortStates.Descending) {
            barGraphTableDataRows = barGraphTableDataRows.toSorted((row1, row2) => { return barGraphTable.compareFuncs[sortedColIndex](row2[sortedColIndex], row1[sortedColIndex]) })
        }
        
        upperGraphTableBody.selectAll("tr").remove();

        for (const row of barGraphTableDataRows) {
            const newRow = upperGraphTableBody.append("tr")
            .selectAll("td")
            .data(row)
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
        }

        tableTitleText = Translation.translate("upperGraph.tableTitle", { amountUnit: nutrientUnit, nutrient });
        upperGraphTableTitle.text(tableTitleText);

        // ---------------------------------------------------------
    }

    // showInfoBox(name, colour, legendItem): Shows the info box
    function showInfoBox({name = "", colour = Colours.None, legendItem = null} = {}) {
        updateInfoBox({name: name, colour: colour});
        legendItem.group.style("cursor", MousePointer.Pointer);
    }

    // hideInfoBox(): Hides the food group description box
    function hideInfoBox() {
        mouseOverFoodGroupName = null;

        upperGraphInfoBox.highlight.attr("stroke", Colours.None);
        drawWrappedText({textGroup: upperGraphInfoBox.titleGroup});
        drawWrappedText({textGroup: upperGraphInfoBox.textGroup});
        drawWrappedText({textGroup: upperGraphInfoBox.subTitleGroup});
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

        const textGroupPosX = GraphDims.upperGraphInfoBoxBorderWidth + GraphDims.upperGraphInfoBoxPadding;
        let currentTextGroupPosY = GraphDims.upperGraphInfoBoxPadding;

        // change the title
        const titleDims = drawText({textGroup: infoBox.titleGroup, text: "Food Group Description", width: GraphDims.upperGraphInfoBoxWidth,
                                    fontSize: GraphDims.upperGraphInfoBoxTitleFontSize, lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing, paddingLeft: GraphDims.upperGraphInfoBoxPadding, paddingRight: GraphDims.upperGraphInfoBoxPadding});

        // change the subtitle
        const subTitleDims = drawText({textGroup: infoBox.subTitleGroup, text: foodGroupName, width: GraphDims.upperGraphInfoBoxWidth,
                                       fontSize: GraphDims.upperGraphInfoBoxFontSize, lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing, paddingLeft: GraphDims.upperGraphInfoBoxPadding, paddingRight: GraphDims.upperGraphInfoBoxPadding});

        // change text
        const textDims = drawText({textGroup: upperGraphInfoBox.textGroup, text: desc, width: GraphDims.upperGraphInfoBoxWidth,
                                   fontSize: GraphDims.upperGraphInfoBoxFontSize, lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing, paddingLeft: GraphDims.upperGraphInfoBoxPadding, paddingRight: GraphDims.upperGraphInfoBoxPadding});
        
        // update the position of the title
        upperGraphInfoBox.titleGroup.attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`)
        currentTextGroupPosY += titleDims.textBottomYPos + GraphDims.upperGraphInfoBoxTitleMarginBtm;
        
        // update the position of the subtitle
        upperGraphInfoBox.subTitleGroup.attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);
        currentTextGroupPosY += subTitleDims.textBottomYPos;

        // update the position for the text box of the description
        upperGraphInfoBox.textGroup.attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);
        currentTextGroupPosY += textDims.textBottomYPos;

        // change colour
        upperGraphInfoBox.highlight.attr("stroke", GraphColours[foodGroupName]);

        // update the height of the info box to be larger than the height of the text
        let infoBoxHeight = Math.max(GraphDims.upperGraphInfoBoxHeight, infoBoxTextGroupHeight,  currentTextGroupPosY + GraphDims.upperGraphInfoBoxPadding);
        upperGraphInfoBox.highlight.attr("y2", infoBoxHeight);

        // ---------------------------------------------
    }


    // drawGraphLegend(titleToColours, upperGraphRightPos): Draws the legend
    function drawGraphLegend(titleToColours, upperGraphRightPos){

        // ----------------- draws the legend ---------------------
        
        // attributes for the legend
        const legendItemPaddingHor = 0;
        const legendItemPaddingVert = 2;
        const legendItemTextPaddingHor = 5;
        const legendItemTextPaddingVert = 0;
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
        const title = Translation.translate("upperGraph.toolTipTitle", {name: d[0]});
        const lines = Translation.translate("upperGraph.toolTip", { 
            returnObjects: true, 
            context: graphType,
            amount: parseFloat(d[1]).toFixed(1),
            percentage: parseFloat(d[1]).toFixed(1),
            nutrient: d[0],
            unit: nutrientUnit
        });
        
        // ------- draw the tooltip ------------

        // attributes for the tool tip
        const toolTip = {};
        let toolTipWidth = GraphDims.upperGraphTooltipMinWidth;
        let toolTipHeight = GraphDims.upperGraphTooltipHeight;
        const textGroupPosX = GraphDims.upperGraphTooltipBorderWidth + GraphDims.upperGraphTooltipPaddingHor +  GraphDims.upperGraphTooltipTextPaddingHor;
        let currentTextGroupPosY = GraphDims.upperGraphTooltipPaddingVert + GraphDims.upperGraphTooltipTextPaddingVert;

        const toolTipHighlightXPos = GraphDims.upperGraphTooltipPaddingHor + GraphDims.upperGraphTooltipBorderWidth / 2;

        // draw the container for the tooltip
        toolTip.group = upperGraphTooltips.append("g")
            .attr("id",  toolTipId)
            .attr("opacity", 0);

        // draw the background for the tooltip
        toolTip.background = toolTip.group.append("rect")
            .attr("height", toolTipHeight)
            .attr("width", toolTipWidth)
            .attr("fill", Colours.White)
            .attr("stroke", colour)
            .attr("stroke-width", 1)
            .attr("rx", 5);

        // draw the highlight
        toolTip.highlight = toolTip.group.append("line")
            .attr("x1", toolTipHighlightXPos)
            .attr("x2", toolTipHighlightXPos)
            .attr("y1", GraphDims.upperGraphTooltipPaddingVert)
            .attr("y2", toolTipHeight - GraphDims.upperGraphTooltipPaddingVert)
            .attr("stroke", colour) 
            .attr("stroke-width", GraphDims.upperGraphTooltipBorderWidth)
            .attr("stroke-linecap", "round");

        // draw the title
        toolTip.titleGroup = toolTip.group.append("text")
            .attr("font-size", GraphDims.upperGraphTooltipFontSize)
            .attr("font-weight", FontWeight.Bold)
            .attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);

        const titleDims = drawText({textGroup: toolTip.titleGroup, text: title, fontSize: GraphDims.upperGraphTooltipFontSize, 
                                    textWrap: TextWrap.NoWrap, padding: GraphDims.upperGraphTooltipPaddingVert});

        currentTextGroupPosY += titleDims.textBottomYPos + GraphDims.upperGraphTooltipTitleMarginBtm;

        // draw the text
        toolTip.textGroup = toolTip.group.append("text")
            .attr("font-size", GraphDims.upperGraphTooltipFontSize)
            .attr("transform", `translate(${textGroupPosX}, ${currentTextGroupPosY})`);

        const textDims = drawText({textGroup: toolTip.textGroup, text: lines, fontSize: GraphDims.upperGraphTooltipFontSize, 
                                   textWrap: TextWrap.NoWrap, padding: GraphDims.upperGraphTooltipPaddingVert});

        currentTextGroupPosY += textDims.textBottomYPos;

        // update the height of the tooltip to be larger than the height of all the text
        toolTipHeight = Math.max(toolTipHeight, currentTextGroupPosY + GraphDims.upperGraphTooltipPaddingVert + GraphDims.upperGraphTooltipTextPaddingVert);
        toolTip.background.attr("height", toolTipHeight);
        toolTip.highlight.attr("y2", toolTipHeight - GraphDims.upperGraphTooltipPaddingVert);

        // update the width of the tooltip to be larger than the width of all the text
        toolTipWidth = Math.max(toolTipWidth, 2 * GraphDims.upperGraphTooltipPaddingHor + GraphDims.upperGraphTooltipBorderWidth + 2 * GraphDims.upperGraphTooltipTextPaddingHor + Math.max(titleDims.width, textDims.width));
        toolTip.background.attr("width", toolTipWidth);

        // -------------------------------------
        
        hoverToolTips[toolTipId] = toolTip;
        return toolTip;
    }

    // saveAsImage(): Saves the bar graph as an image
    async function saveAsImage() {
        // use await so that the below operations can happen in the order they are listed
        //  to simulate a mutex.
        // 
        // We do not want the operations to run at the same time or have the compiler reorder the lines for optimization.
        //  (or else you may have a picture of a graph without the source text)
        // https://blog.mayflower.de/6369-javascript-mutex-synchronizing-async-operations.html
        await footNotesContainer.attr("visibility", "visible");
        const svg = document.getElementById("upperGraph").firstChild;
        await saveSvgAsPng(svg, `${graphTitleText}.png`, {backgroundColor: "white"});
        await footNotesContainer.attr("visibility", "hidden");
    }

    // downloadTable(): Exports the table of the bar graph as a CSV file
    function downloadTable() {
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + model.barGraphTable.csvContent);

        // creates a temporary link for exporting the table
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${tableTitleText}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}