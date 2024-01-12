import { GraphColours } from "../../../assets/colours/graphColours.js";
import { GraphDims } from "../../../assets/dimensions/graphDimensions.js";
import { FoodGroupDescDataColNames } from "../../../assets/strings/columnNames.js";
import { Component } from "../component.js";
import { Infobox } from "../infobox/infobox.js";
import { TranslationTools } from "../../../tools/translationTools.js";


export class barGraph extends Component {
    constructor(data, foodGroupDescriptions) {
        super();
        this.data = data;
        this.foodGroupDescriptions = foodGroupDescriptions;
        
        this.focusedFoodGroup = null;
    }

    draw() {
        return this.upperGraph(this.data, this.foodGroupDescriptions);
    }

    upperGraph(data, foodGroupDescriptions){
        const self = this;
        const upperGraphSvgWidth = GraphDims.upperGraphWidth + GraphDims.upperGraphLeft + GraphDims.upperGraphRight;
        const upperGraphSvgHeight = GraphDims.upperGraphHeight + GraphDims.upperGraphTop + GraphDims.upperGraphBottom;
    
        /* Create svg components */
        const upperGraphSvg = d3.select("#upperGraph")
            .append("svg")
                .attr("width", upperGraphSvgWidth)
                .attr("height", upperGraphSvgHeight)
                .attr("viewBox", [0, 0, upperGraphSvgWidth, upperGraphSvgHeight])
                .attr("style", "max-width: 100%; height: auto;");
    
        const upperGraphHeading = upperGraphSvg.append("g")
            .append("text")
                .attr("text-anchor", "middle")
                .attr("font-size", GraphDims.upperGraphChartHeadingFontSize)
                .attr("x", GraphDims.upperGraphLeft + GraphDims.upperGraphWidth / 2)
                .attr("y", GraphDims.upperGraphTop - GraphDims.upperGraphChartHeadingFontSize * 1.25)
    
        const upperGraphBars = upperGraphSvg.append("g")
        .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`)
    
        const upperGraphAxes = upperGraphSvg.append("g");
    
        const upperGraphXAxis = upperGraphAxes.append("g")
        const upperGraphXAxisLine = upperGraphXAxis.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop + GraphDims.upperGraphHeight})`);
            
        const upperGraphXAxisScale = d3.scaleBand()
            .range([0, GraphDims.upperGraphWidth])
        const upperGraphXAxisLabel = upperGraphXAxis.append("text")
    
        const upperGraphYAxis = upperGraphAxes.append("g")
        const upperGraphYAxisLine = upperGraphYAxis.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, ${GraphDims.upperGraphTop})`);
    
        const upperGraphYAxisLabel = upperGraphYAxis.append("text")
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("y", GraphDims.upperGraphLeft / 4)
            .attr("x", -(GraphDims.upperGraphTop + GraphDims.upperGraphHeight / 2));
            
        const upperGraphYAxisScale = d3.scaleLinear()
            .range([GraphDims.upperGraphHeight, 0]);
    
        const upperGraphLegend = upperGraphSvg.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft + GraphDims.upperGraphWidth}, ${GraphDims.upperGraphTop})`);
    
        /* Sets up alternator between graph types (percentage vs number) */
        const typeIterator = getGraphType();
        let graphType = typeIterator.next().value;
    
        const upperGraphTable = d3.select("#upperGraphTable");
        const upperGraphTableHeading = upperGraphTable.append("thead");
        const upperGraphTableBody = upperGraphTable.append("tbody");
        const upperGraphTableTitle = d3.select("#upperGraphTableTitle");
    
        const upperGraphSwitchTypeButton = d3.select("#upperGraphSwitchType");
        
        /* Food group description elements changed on hover */
        const upperGraphInfoBox = new Infobox(upperGraphSvg, GraphDims.upperGraphLeft + GraphDims.upperGraphWidth, GraphDims.upperGraphTop + GraphDims.upperGraphHeight - GraphDims.upperGraphInfoBoxHeight, 
                                              GraphDims.upperGraphInfoBoxWidth, GraphDims.upperGraphInfoBoxHeight, GraphDims.upperGraphInfoBoxFontSize, GraphDims.upperGraphInfoBoxBorderWidth, 
                                              GraphDims.upperGraphInfoBoxPaddingLeft, GraphDims.upperGraphInfoBoxLineSpacing, 
                                              GraphDims.upperGraphInfoBoxBorderWidth - GraphDims.upperGraphInfoBoxWidth / 2, GraphDims.upperGraphInfoBoxBorderWidth);

        upperGraphInfoBox.draw();
    
        const upperGraphTooltips = upperGraphSvg.append("g");
        const upperGraphBarHoverDetect = upperGraphSvg.append("g")
            .attr("transform", `translate(${GraphDims.upperGraphLeft}, 0)`);
    
        /* Draw colour legend */
        drawGraphLegend(upperGraphLegend, GraphColours);
    
        /* Update bar graph given a specific nutrient */
        return async function updateGraph(nutrient){
            /* graphType is updated by the getGraphType function */
            let type = graphType;
    
            const nutrientData = data.getNutrientData(nutrient);
    
            const xAxisValues = Object.keys(nutrientData);
            upperGraphXAxisScale.domain(xAxisValues)
            upperGraphXAxisLine.call(d3.axisBottom(upperGraphXAxisScale));
    
            const xAxisTicks = upperGraphXAxisLine.selectAll(".tick");
    
            const nutrientTotalByAgeSexGroup = data.findNutrientTotalAmtPerAgeSexGroup(nutrientData, type);
            const groupedAmount = nutrientTotalByAgeSexGroup.groupedAmount;
            const maxAccumulatedAmount = nutrientTotalByAgeSexGroup.maxAccumulatedAmount;
    
            upperGraphYAxisScale.domain([0, type === "number" ? Math.round(maxAccumulatedAmount * 1.2 / 10) * 10 : 100])
            upperGraphYAxisLine.call(d3.axisLeft(upperGraphYAxisScale));
            upperGraphYAxisLabel.text(TranslationTools.translateText(`upperGraph.${type}.yAxisTitle`, { nutrient, amountUnit: getNutrientUnit(nutrient) }))
    
            upperGraphBars.selectAll("g").remove();
            upperGraphBarHoverDetect.selectAll("g").remove();
    
            upperGraphTooltips.selectAll("g").remove();
    
            const barOnClick = (dt) => {
                /* Zooming in on a specific category */
                upperGraphTooltips.selectAll("g").remove();
    
                const category = dt[0];
                self.focusedFoodGroup = dt;

                const barData = Object.values(groupedAmount).map(g => {
                    const obj = {};
                    obj[category] = g[category];
                    return obj;
                });
                upperGraphYAxisScale.domain([0, d3.max(Object.values(barData).map(b => b[category])) * 1.15]);
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
                                self.focusedFoodGroup = null;
                                updateGraph(nutrient);
                            }, i + 1)  
                    )         
            }

            if (self.focusedFoodGroup !== null) {
                barOnClick(self.focusedFoodGroup);
            }
    
            upperGraphBars.selectAll("g")
                .data(Object.values(groupedAmount))
                .enter()
                .each(
                    (d, i) => 
                        drawUpperGraphStackedBars(upperGraphBars, d, xAxisTicks.nodes()[i].getAttribute("transform"), barOnClick, i + 1
                    )
                )
    
            // draw the graph title
            upperGraphHeading.text(TranslationTools.translateText(`upperGraph.${type}.graphTitle`, { nutrient, amountUnit: getNutrientUnit(nutrient)}))
    
            //draw the table
            drawTable(nutrient);
    
            // switch type button
            upperGraphSwitchTypeButton.text(TranslationTools.translateText(`upperGraph.${type}.switchTypeButton`))
                .on("click", () => {
                    /* Iterator returns either percentage or number */
                    graphType = typeIterator.next().value;
                    updateGraph(nutrient);
                });
        }
    
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
                    .on("mouseover", (d, i) => onBarHover(d, mult * 100 + i))
                    .on("mousemove", (d, i) => onBarHover(d, mult * 100 + i))
                    .on("mouseenter", (d, i) => onBarHover(d, mult * 100 + i))
                    .on("mouseleave", (d, i) => onBarUnHover(d, mult * 100 + i))
                    .on("click", onClick);
        }
    
        /* Set the opacity of the hovered bar's info to be 1 */
        function onBarHover(d, i){
            updateInfoBox(d);
    
            const mousePos = d3.mouse(upperGraphSvg.node());
    
            const element = d3.select(`#barHover${i}`);
    
            if (element.attr("opacity") === "0") {
                element.attr("opacity", 1);
            }
    
            element.attr("transform", `translate(${mousePos[0]}, ${mousePos[1]})`);
    
        }
    
        /* Set the opacity of the previously hovered bar's info to be 0 */
        function onBarUnHover(d, i){
            d3.select(`#barHover${i}`).attr("opacity", 0);
        }
    
        /* Creates tooltip for hovering over bars */
        function hoverTooltip(d, i){
            const colour = GraphColours[d[0]];
                const card = upperGraphTooltips.append("g")
                    .attr("id", `barHover${i}`)
                    .attr("fill", colour)
                    .attr("opacity", 0);
    
                const cardRect = card.append("rect")
                    .attr("height", 50)
                    .attr("fill", "white")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-width", 3)
                    .attr("stroke", colour)
                    .attr("x", 0)
                    .attr("y", 0);
                
                const lines = TranslationTools.translateText("upperGraph.infoBox", { 
                    returnObjects: true, 
                    context: graphType,
                    amount: d[1],
                    name: d[0],
                    percentage: d[1],
                    nutrient: d[0]
                });
                
                /* Create the text elements of the tooltip */
                let width = GraphDims.upperGraphTooltipMinWidth;
                lines.map((line, lineNum) => {
                    const text = card.append("text")
                        .attr("x", 10)
                        .attr("y", (lineNum + 1) * 10)
                        .attr("font-size", GraphDims.upperGraphTooltipFontSize)
                        .text(line);
                    width = Math.max(text.node().getComputedTextLength() + 20, width);
                })
                cardRect.attr("width", width);
        }
    
        /* Update food group description box */
        function updateInfoBox(d){
            /* d = [food group name, amount] */
            const desc = foodGroupDescriptions[d[0]][FoodGroupDescDataColNames.description];

            upperGraphInfoBox.updateText(desc, GraphColours[d[0]]);
        }
    
        function drawTable(nutrient){
            const nutrientData = data.getNutrientData(nutrient);
            const ageSexGroupHeadings = [
                "Population age 1+", 
                "Children 1 to 8 y", 
                "Youth & adolescents 9 to 18 y",
                "Adult males 19 y +",
                "Adult females* 19 y +"
            ];
            const headingsPerSexAgeGroup = ["Amount (g)", "Amount SE", "% of total intake", "% SE"];
            const headingsPerSexAgeGroupKeys = ["Amount", "Amount_SE", "Percentage", "Percentage_SE"];
    
            const nutrientAgeGroups = Object.keys(nutrientData);
    
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
                    .data([foodLevelGroup].concat(d.map(g => headingsPerSexAgeGroupKeys.map(key => g[key])).flat()))
                    .enter()
                    .append("td")
                        .attr("colspan", 1)
                        .text((d) => Number.isNaN(d) ? "" : d)
                        .attr("class", (d, i) => i !== 0 ? "brdr-lft" : "")
                        .style("border-left", (d, i) => (i + 1) % 4 === 2 ? GraphDims.tableSectionBorderLeft : "");
            });
    
            upperGraphTableTitle.text(TranslationTools.translateText("upperGraph.tableTitle", { amountUnit: getNutrientUnit(nutrient), nutrient }))
        }
    
        /* Draw the food group colour legend */
        function drawGraphLegend(element, titleToColours){
            Object.entries(titleToColours).forEach((entry, i) => {
                const [title, colour] = entry;

                if (title == "All Items") {
                    return;
                }

                const groupElement = element.append("g");
                groupElement.append("rect")
                    .attr("y", i * GraphDims.legendRowHeight + (GraphDims.legendRowHeight - GraphDims.legendSquareSize ) / 2)
                    .attr("width", GraphDims.legendSquareSize)
                    .attr("height", GraphDims.legendSquareSize)
                    .attr("fill", colour)
                    .on("mouseenter", () => updateInfoBox([title, 0]));
                groupElement.append("text")
                    .attr("y", (i) * GraphDims.legendRowHeight + GraphDims.legendFontSize * 0.8 + (GraphDims.legendRowHeight - GraphDims.legendFontSize ) / 2)
                    .attr("x", 25)
                    .attr("font-size", GraphDims.legendFontSize)
                    .text(TranslationTools.translateText(title))
                    .on("mouseenter", () => updateInfoBox([title, 0]));    
                    
            })
        }
    
        function getNutrientUnit(nutrient){
            const nutrientData = data.getNutrientData(nutrient);
            return Object.values(Object.values(nutrientData)[0])[0][0]["Unit"];
        }
    
        /* This generator function is used to set the value for the "graphType" and "type" variable */
        function *getGraphType(){
            while(true){
                yield "number";
                yield "percentage";
            }
        }
    }
}

