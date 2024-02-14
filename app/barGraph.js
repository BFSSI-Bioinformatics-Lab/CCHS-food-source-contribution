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
/////////////////////////////////////////////////////////////////////////



import { Colours, GraphColours, GraphDims, TextWrap, FoodGroupDescDataColNames, FontWeight, MousePointer, TranslationTools} from "../assets/assets.js";
import { Visuals } from "./visuals.js";


export class BarGraph {
    constructor({model = null} = {}) {
        this.model = model;

        // === Data retrieves from the model ===
        this.nutrient = "";
        this.data = [];
        this.foodGroupDescriptions = [];

        this.getUpdatedModelData();

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
        const nutrientData = this.data.getNutrientData(nutrient);
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
        const desc = this.foodGroupDescriptions[foodGroupName][FoodGroupDescDataColNames.description];

        Visuals.updateInfoBox({infoBox: this.upperGraphInfoBox, colour: GraphColours[foodGroupName], text: desc, width: GraphDims.upperGraphInfoBoxWidth, 
                               fontSize: GraphDims.upperGraphInfoBoxFontSize, lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing,
                               padding: GraphDims.upperGraphInfoBoxPadding});
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

    /* Creates tooltip for hovering over bars */
    hoverTooltip(d, i){
        const toolTipId = this.getToolTipId(i);
        const colour = GraphColours[d[0]];
        const lines = TranslationTools.translateText("upperGraph.infoBox", { 
            returnObjects: true, 
            context: this.graphType,
            amount: d[1],
            name: d[0],
            percentage: d[1],
            nutrient: d[0]
        });

        const toolTip = Visuals.drawToolTip({parent: this.upperGraphTooltips, 
                                             id: toolTipId, 
                                             height: 50, 
                                             width: GraphDims.upperGraphTooltipMinWidth, 
                                             text: lines, 
                                             padding: [GraphDims.upperGraphTooltipLeftPadding, GraphDims.upperGraphTooltipTopPadding],
                                             backgroundColour: Colours.White, 
                                             borderColour: colour, 
                                             borderWidth: 3, 
                                             textWrap: TextWrap.NoWrap,
                                             fontSize: GraphDims.upperGraphTooltipFontSize, 
                                             lineSpacing: GraphDims.upperGraphTooltipLineSpacing, 
                                             opacity: 0});

        this.hoverToolTips[toolTipId] = toolTip;
    }

    // getUpdatedModelData(): Retrieves the updated versions of the data from the model
    getUpdatedModelData() {
        this.nutrient = this.model.nutrient;
        this.data = this.model.foodIngredientData;
        this.foodGroupDescriptions = this.model.foodGroupDescriptionData.data;
    }

    /* Update bar graph given a specific nutrient */
    async updateGraph(){
        // get the updated data for the graph
        this.getUpdatedModelData();

        const nutrient = this.nutrient;
        const nutrientData = this.data.getNutrientData(nutrient);

        /* graphType is updated by the getGraphType function */
        let type = this.graphType;

        const xAxisValues = this.data.ageSexGroupHeadings;
        this.upperGraphXAxisScale.domain(xAxisValues);
        this.upperGraphXAxisLine.call(d3.axisBottom(this.upperGraphXAxisScale));

        this.xAxisTicks = this.upperGraphXAxisLine.selectAll(".tick").attr("font-size", GraphDims.upperGraphXAxisTickFontSize);

        const nutrientTotalByAgeSexGroup = this.data.findNutrientTotalAmtPerAgeSexGroup(nutrientData, type);
        this.groupedAmount = nutrientTotalByAgeSexGroup.groupedAmount;
        const maxAccumulatedAmount = nutrientTotalByAgeSexGroup.maxAccumulatedAmount;

        this.upperGraphYAxisScale.domain([0, type === "number" ? Math.round(maxAccumulatedAmount * 1.2 / 10) * 10 : 100])
        this.upperGraphYAxisLine.call(d3.axisLeft(this.upperGraphYAxisScale));
        this.upperGraphYAxisLabel.text(TranslationTools.translateText(`upperGraph.${type}.yAxisTitle`, { nutrient, amountUnit: this.getNutrientUnit(nutrient) }));

        this.yAxisTicks = this.upperGraphYAxisLine.selectAll(".tick").attr("font-size", GraphDims.upperGraphYAxisTickFontSize);

        this.upperGraphBars.selectAll("g").remove();
        this.upperGraphBarHoverDetect.selectAll("g").remove();

        this.upperGraphTooltips.selectAll("g").remove();

        if (this.focusedFoodGroup !== null) {
            this.barOnClick(this.focusedFoodGroup);
        }

        this.upperGraphBars.selectAll("g")
            .data(Object.values(this.groupedAmount))
            .enter()
            .each(
                (d, i) => 
                    this.drawUpperGraphStackedBars(this.upperGraphBars, d, this.xAxisTicks.nodes()[i].getAttribute("transform"), (dt) => this.barOnClick(dt), i + 1
                )
            )

        // draw the graph title
        this.upperGraphHeading.text(TranslationTools.translateText(`upperGraph.${type}.graphTitle`, { nutrient, amountUnit: this.getNutrientUnit(nutrient)}))
            .attr("font-weight", FontWeight.Bold);

        //draw the table
        this.drawTable(nutrient);

        // switch type button
        this.upperGraphSwitchTypeButton.text(TranslationTools.translateText(`upperGraph.${type}.switchTypeButton`))
            .on("click", () => {
                /* Iterator returns either percentage or number */
                this.graphType = this.typeIterator.next().value;
                this.updateGraph(nutrient);
            });
    }

    draw() {
        return this.upperGraph();
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
                .on("mouseover", (d, index, elements) => {this.onBarHover(d, mult * 100 + index, index, elements)})
                .on("mousemove", (d, index, elements) => this.onBarHover(d, mult * 100 + index, index, elements))
                .on("mouseenter", (d, index, elements) => this.onBarHover(d, mult * 100 + index, index, elements))
                .on("mouseleave", (d, index, elements) => this.onBarUnHover(d, mult * 100 + index, index, elements))
                .on("click", onClick);
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
        const legend = Visuals.drawLegend({parent: this.upperGraphSvg, 
                                           x: upperGraphRightPos, 
                                           y: GraphDims.upperGraphTop,
                                           data: Object.entries(titleToColours).filter(nameColourKVP => nameColourKVP[0] != "All Items"),
                                           legendItemPadding: [0, 2], 
                                           textPadding: [5, 0], 
                                           colourBoxWidth: GraphDims.legendSquareSize,
                                           colourBoxHeight: GraphDims.legendSquareSize,
                                           fontSize: 12});

        // add the mouse events to the keys of the legend
        for (const legendItem of legend.legendItems) {
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
        const nutrientData = this.data.getNutrientData(nutrient);
        const ageSexGroupHeadings = this.data.ageSexGroupHeadings;
        const headingsPerSexAgeGroup = ["Amount (g)", "Amount SE", "% of total intake", "% SE"];
        const headingsPerSexAgeGroupKeys = ["Amount", "Amount_SE", "Percentage", "Percentage_SE"];

        const nutrientAgeGroups = Object.keys(nutrientData);

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
                    const colNum = (i + 1) % 4;
                    if (colNum === 2 || colNum === 0) {
                        return FontWeight.Bold;
                    }

                    return FontWeight.Normal;
                })
                .style("opacity", (d, i) => {
                    const colNum = (i + 1) % 4;
                    if (colNum === 3 || colNum === 1) {
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
                .data([foodLevelGroup].concat(d.map(g => headingsPerSexAgeGroupKeys.map(key => g[key])).flat()))
                .enter()
                .append("td")
                    .attr("colspan", 1)
                    .text((d) => Number.isNaN(d) ? "" : d)
                    .attr("class", (d, i) => i !== 0 ? "brdr-lft" : "")
                    .style("border-left", (d, i) => (i + 1) % 4 === 2 ? GraphDims.tableSectionBorderLeft : "")
                    .style("font-size", "12px")
                    .style("font-weight", (d, i) => {
                        const colNum = (i + 1) % 4;
                        if (colNum === 2 || colNum === 0) {
                            return FontWeight.Bold;
                        }
    
                        return FontWeight.Normal; 
                    })
                    .style("opacity", (d, i) => {
                        const colNum = (i + 1) % 4;
                        if (colNum === 3 || colNum === 1) {
                            return 0.8;
                        }
    
                        return 1;
                    });
        });

        this.upperGraphTableTitle.text(TranslationTools.translateText("upperGraph.tableTitle", { amountUnit: this.getNutrientUnit(nutrient), nutrient }))
    }

    upperGraph(){
        const self = this;
        const upperGraphSvgWidth = GraphDims.upperGraphWidth + GraphDims.upperGraphLeft + GraphDims.upperGraphRight;
        const upperGraphSvgHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop + GraphDims.upperGraphBottom;
        const upperGraphRightPos = GraphDims.upperGraphLeft + GraphDims.upperGraphWidth + GraphDims.upperGraphInfoBoxLeftMargin;

        // register the button to save the bar graph as a png
        d3.select("#upperGraphSaveGraph").on("click", () => this.saveAsImage());
    
        /* Create svg component */
        this.upperGraphSvg = d3.select("#upperGraph")
            .append("svg")
                .attr("width", upperGraphSvgWidth)
                .attr("height", upperGraphSvgHeight)
                .attr("viewBox", [0, 0, upperGraphSvgWidth, upperGraphSvgHeight])
                .attr("style", "max-width: 100%; height: auto;");

        // create the background for the graph
        this.upperGraphSvgBackground = this.upperGraphSvg.append("rect")
            .attr("fill", Colours.None)
            .attr("width", upperGraphSvgWidth)
            .attr("height", upperGraphSvgHeight)
    
        this.upperGraphHeading = self.upperGraphSvg.append("g")
            .append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", GraphDims.upperGraphChartHeadingFontSize)
                .attr("x", GraphDims.upperGraphLeft + GraphDims.upperGraphWidth / 2)
                .attr("y", GraphDims.upperGraphTop - GraphDims.upperGraphChartHeadingFontSize * 1.25)
    
        this.upperGraphBars = self.upperGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`)
    
        const upperGraphAxes = self.upperGraphSvg.append("g");
    
        const upperGraphXAxis = upperGraphAxes.append("g");
        this.upperGraphXAxisLine = upperGraphXAxis.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop + GraphDims.upperGraphHeight})`);
            
        this.upperGraphXAxisScale = d3.scaleBand()
            .range([0, GraphDims.upperGraphWidth])
        const upperGraphXAxisLabel = upperGraphXAxis.append("text");
    
        const upperGraphYAxis = upperGraphAxes.append("g")
        this.upperGraphYAxisLine = upperGraphYAxis.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop})`);
    
        this.upperGraphYAxisLabel = upperGraphYAxis.append("text").attr("font-size", GraphDims.upperGraphAxesFontSize)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("y", GraphDims.upperGraphLeft / 4)
            .attr("x", -(GraphDims.upperGraphTop + GraphDims.upperGraphHeight / 2));
            
        this.upperGraphYAxisScale = d3.scaleLinear()
            .range([GraphDims.upperGraphHeight, 0]);
    
        /* Sets up alternator between graph types (percentage vs number) */
        this.graphType = this.typeIterator.next().value;
    
        const upperGraphTable = d3.select("#upperGraphTable");

        // remove any dummy tables that says "no data available in table" produced by JQuery
        upperGraphTable.selectAll("thead").remove();
        upperGraphTable.selectAll("tbody").remove();

        this.upperGraphTableHeading = upperGraphTable.append("thead");
        this.upperGraphTableBody = upperGraphTable.append("tbody");
        this.upperGraphTableTitle = d3.select("#upperGraphTableTitle");
    
        this.upperGraphSwitchTypeButton = d3.select("#upperGraphSwitchType");
        
        /* Food group description elements changed on hover */
        this.upperGraphInfoBox = Visuals.drawInfoBox({parent: this.upperGraphSvg, 
                                                      x: upperGraphRightPos, 
                                                      y: GraphDims.upperGraphTop + GraphDims.upperGraphHeight - GraphDims.upperGraphInfoBoxHeight, 
                                                      height: GraphDims.upperGraphInfoBoxHeight, 
                                                      borderWidth: GraphDims.upperGraphInfoBoxBorderWidth,
                                                      lineSpacing: GraphDims.upperGraphInfoBoxLineSpacing,
                                                      padding: GraphDims.upperGraphInfoBoxPadding,
                                                      fontSize: GraphDims.upperGraphInfoBoxFontSize});

        /* Draw colour legend */
        this.drawGraphLegend(GraphColours, upperGraphRightPos);
    
        self.upperGraphTooltips = self.upperGraphSvg.append("g");
        self.upperGraphBarHoverDetect = self.upperGraphSvg.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`);

        return (nutrient) => {self.updateGraph(nutrient)};
    }

    // saveAsImage(): Saves the bar graph as an image
    saveAsImage() {
        const svg = document.getElementById("upperGraph").firstChild;
        saveSvgAsPng(svg, "BarGraph.png", {backgroundColor: "white"});
    }
}

