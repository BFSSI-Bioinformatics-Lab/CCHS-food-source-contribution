const translationObj = {
    en: {
        translation: {
            "upperGraph": {
                "number": {
                    "graphTitle": "Daily {{ nutrient }} intake per person ({{ amountUnit }}/d) provided by 12 food groups.",
                    "yAxisTitle": "{{nutrient}} Intake ({{ amountUnit }}/d)",
                    "switchTypeButton": "Switch to Percentage"
                },
                "percentage": {
                    "graphTitle": "Percentage of total {{ nutrient }} intake provided by 12 food groups.",
                    "yAxisTitle": "% of total {{nutrient}} intake",
                    "switchTypeButton": "Switch to Numbers"
                },
                "graphFootnote": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
                "tableTitle": "Absolute ({{ amountUnit }}/day) and relative (%) contribution of 12 food groups to daily {{nutrient}} intake",   
                "infoBox_number": [
                    "{{- name }}",
                    "Amount: {{amount}}"
                ],
                "infoBox_percentage": [
                    "{{- name }}",
                    "{{ percentage }}% of total {{ nutrient }} intake."
                ]
            },
            "lowerGraph": {
                "graphTitle": "Food groups and sub-groups contribution to {{ nutrient }} intake in Canadian {{ ageSexGroup }}",
                "graphFootnote": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
                "tableTitle": "Absolute ({{ amountUnit }}/day) and relative (%) contribution of food groups and sub-groups to daily {{nutrient}} intake in Canadian {{ ageSexGroup }}, 2015",
                "seeLevel2Groups": "Filter on level 2 groups",
                "seeAllGroups": "See all food groups",
                "infoBoxLevel_1": [
                    "{{- name }}",
                    "{{ percentage }}% of total {{ nutrient }} intake."
                ],
                "infoBoxLevel_2": [
                    "{{- name }}",
                    "Contribution to:",
                    "Total {{ nutrient }} intake: {{ percentage }}%",
                    "{{- parentGroup }} group: {{ parentPercentage }}%"
                ],
                "infoBoxLevel_3": [
                    "{{- name }}",
                    "Contribution to:",
                    "Total {{ nutrient }} intake: {{ percentage }}%",
                    "{{- parentGroup }}: {{ parentPercentage }}%"
                ],
                /* If the context number is not between 1-3 */
                "hoverBoxLevel_other": [ 
                    "{{ name }}",
                    "{{ percentage }}% of total {{ nutrient }} intake."
                ],
            }
        }
    },
    fr: { 
        translation: {} 
    }
}

window.addEventListener("load", () => {
    registerTranslation(translationObj);
    setupTool();
})

async function setupTool(){
    const [expandedTableData, upperLayerData, fullyNestedData]  = await loadNutrientData();
    const foodGroupDescriptionsData = await loadFoodGroupDescriptionData(); 
    const nutrientOptions = Object.keys(upperLayerData);

    const nutrientSelector = d3.select("#upperGraphNutrientSelect")
        .on("change", updateTool)
        .selectAll("option")
        .data(nutrientOptions)
        .enter()
        .append("option")
            .attr("title", d => d)
            .property("value", d => d)
            .text(d => d);
            
    const updateUpperGraph = upperGraph(upperLayerData, foodGroupDescriptionsData);
    const updateLowerGraph = lowerGraph(fullyNestedData, foodGroupDescriptionsData, expandedTableData);


    function updateTool(){
        const nutrient = getSelector("#upperGraphNutrientSelect");
        updateUpperGraph(nutrient);
        updateLowerGraph(nutrient);
    }

    updateTool();
}

async function loadNutrientData(){
    const data = await d3.csv("data/FSCT data_Food_ingredients CCHS 2015 all nutrients_Infobase.csv")
    // convert all numeric fields into floats:
    data.forEach(d => {
        Object.keys(d).forEach(key => d[key] = isNaN(d[key]) ? d[key] : parseFloat(d[key]))
    });
    const dataGroupedByNutrientAndDemoList = Object.freeze(d3.nest()
                                    .key(d => d.Nutrient)
                                    .key(d => d["Age-sex group (*: excludes pregnant or breastfeeding)"])
                                    .object(data));
    const dataGroupedByNutrientAndDemo = Object.freeze(d3.nest()
                                    .key(d => d.Nutrient)
                                    .key(d => d["Age-sex group (*: excludes pregnant or breastfeeding)"])
                                    .key(d => d["Food group_level1"])
                                    .object(data));
    const fullyNestedDataByFoodGroup = Object.freeze(d3.nest()
                                        .key(d => d.Nutrient)
                                        .key(d => d["Age-sex group (*: excludes pregnant or breastfeeding)"])
                                        .key(d => d["Food group_level1"])
                                        .key(d => Number.isNaN(d["Food group_level2"]) ? "" : d["Food group_level2"] )
                                        .key(d => Number.isNaN(d["Food group_level3"]) ? "" : d["Food group_level3"] )
                                        .rollup(d => d[0])
                                        .object(data));
    return [dataGroupedByNutrientAndDemoList, dataGroupedByNutrientAndDemo, fullyNestedDataByFoodGroup];
}

async function loadFoodGroupDescriptionData(){
    const data = await d3.csv("data/Food Group descriptions.csv")
    // convert all numeric fields into floats:
    data.forEach(d => {
        Object.keys(d).forEach(key => d[key] = isNaN(d[key]) ? d[key] : parseFloat(d[key]))
    });

    const fullyNestedDataByFoodLevel = Object.freeze(d3.nest()
                                        .key(d => 
                                            Number.isNaN(d["Food Group Name_Level 3"]) ? 
                                                Number.isNaN(d["Food Group Name_Level 2"]) ? 
                                                    d["Food Group Name_Level 1"]
                                                    : d["Food Group Name_Level 2"]
                                                : d["Food Group Name_Level 3"]
                                        )
                                        .rollup(d => d[0])
                                        .object(data));
    return fullyNestedDataByFoodLevel;  
}

function getSelector(id) {
    return d3.select(id)
        .property("value");
}

const dims = Object.freeze({
    upperGraphWidth: 800,
    upperGraphHeight: 600,
    upperGraphLeft: 60,
    upperGraphRight: 400,
    upperGraphTop: 60,
    upperGraphBottom: 60,
    upperGraphTooltipMinWidth: 140,
    upperGraphInfoBoxWidth: 240,
    upperGraphInfoBoxHeight: 200,
    upperGraphInfoBoxFontSize: 12,
    upperGraphChartHeadingFontSize: 20,
    lowerGraphWidth: 700,
    lowerGraphHeight: 700,
    lowerGraphLeft: 60,
    lowerGraphRight: 400,
    lowerGraphTop: 60,
    lowerGraphBottom: 60,
    lowerGraphArcRadius: 70,
    lowerGraphTooltipMinWidth: 140,
    lowerGraphInfoBoxWidth: 240,
    lowerGraphInfoBoxHeight: 200,
    lowerGraphArcLabelFontSize: 12,
    lowerGraphChartHeadingFontSize: 20,    
    lowerGraphInfoBoxFontSize: 12,
    legendFontSize: 12,
    legendSquareSize: 12,
    legendRowHeight: 20,
    tableSectionBorderLeft: "1px solid black",

})

const graphColours = {
    "Baby Foods": "#BAABDA",
    "Beverages (Excluding Milks)": "#F8CB2E",
    "Dairy & Plant-Based Beverages": "#39B7E3",
    "Fats & Oils": "#D8B384",
    "Fish & Seafood": "#FF6969",
    "Fruits & Vegetables": "#3CCF4E",
    "Grain Products": "#EF5B0C",
    "Meat & Poultry": "#BB2525",
    "Meat Alternatives": "#482121",
    "Nutritional Beverages & Bars": "#84F1CD",
    "Soups - Sauces - Spices & Other Ingredients": "#005DD0",
    "Sweets - Sugars & Savoury Snacks": "#824BD0"
}

function upperGraph(data, foodGroupDescriptions){

    const upperGraphSvg = d3.select("#upperGraph")
        .append("svg")
        .attr("width", dims.upperGraphWidth + dims.upperGraphLeft + dims.upperGraphRight)
        .attr("height", dims.upperGraphHeight + dims.upperGraphTop + dims.upperGraphBottom);

    const upperGraphHeading = upperGraphSvg.append("g")
        .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", dims.upperGraphChartHeadingFontSize)
            .attr("x", dims.upperGraphLeft + dims.upperGraphWidth / 2)
            .attr("y", dims.upperGraphTop - dims.upperGraphChartHeadingFontSize * 1.25);

    const upperGraphBars = upperGraphSvg.append("g")
    .attr("transform", `translate(${dims.upperGraphLeft}, 0)`)

    const upperGraphAxes = upperGraphSvg.append("g");

    const upperGraphXAxis = upperGraphAxes.append("g")
    const upperGraphXAxisLine = upperGraphXAxis.append("g")
        .attr("transform", `translate(${dims.upperGraphLeft}, ${dims.upperGraphTop + dims.upperGraphHeight})`)
    const upperGraphXAxisScale = d3.scaleBand()
        .range([0, dims.upperGraphWidth])
    const upperGraphXAxisLabel = upperGraphXAxis.append("text")

    const upperGraphYAxis = upperGraphAxes.append("g")
    const upperGraphYAxisLine = upperGraphYAxis.append("g")
        .attr("transform", `translate(${dims.upperGraphLeft}, ${dims.upperGraphTop})`);

    const upperGraphYAxisLabel = upperGraphYAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("y", dims.upperGraphLeft / 4)
        .attr("x", -(dims.upperGraphTop + dims.upperGraphHeight / 2));
        
    const upperGraphYAxisScale = d3.scaleLinear()
        .range([dims.upperGraphHeight, 0]);

    const upperGraphLegend = upperGraphSvg.append("g")
        .attr("transform", `translate(${dims.upperGraphLeft + dims.upperGraphWidth}, ${dims.upperGraphTop})`);

    const typeIterator = getGraphType();
    let graphType = typeIterator.next().value;

    const upperGraphTable = d3.select("#upperGraphTable");
    const upperGraphTableHeading = upperGraphTable.append("thead");
    const upperGraphTableBody = upperGraphTable.append("tbody");
    const upperGraphTableTitle = d3.select("#upperGraphTableTitle");

    const upperGraphSwitchTypeButton = d3.select("#upperGraphSwitchType");
    
    const upperGraphInfoBox = upperGraphSvg.append("g")
        .attr("transform", `translate(${dims.upperGraphLeft + dims.upperGraphWidth},${dims.upperGraphTop + dims.upperGraphHeight - dims.upperGraphInfoBoxHeight})`);

    const upperGraphInfoBoxRect = upperGraphInfoBox.append("rect")
        .attr("stroke", "grey")
        .attr("fill", "none")
        .attr("width", dims.upperGraphInfoBoxWidth)
        .attr("height", dims.upperGraphInfoBoxHeight)
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
    const upperGraphInfoBoxText = upperGraphInfoBox.append("text")
        .attr("font-size", dims.upperGraphInfoBoxFontSize);

    const upperGraphTooltips = upperGraphSvg.append("g");
    const upperGraphBarHoverDetect = upperGraphSvg.append("g")
        .attr("transform", `translate(${dims.upperGraphLeft}, 0)`);

    drawGraphLegend(upperGraphLegend, graphColours);

    return async function updateGraph(nutrient){
        let type = graphType;

        const xAxisValues = Object.keys(data[nutrient]);
        upperGraphXAxisScale.domain(xAxisValues)
        upperGraphXAxisLine.call(d3.axisBottom(upperGraphXAxisScale));

        const xAxisTicks = upperGraphXAxisLine.selectAll(".tick");
        
        const nutrientData = data[nutrient];
        let maxAccumulatedAmount = 0;
        const keyName = type === "number" ? "Amount" : "Percentage"
        // calculate the total amount by nutrient per age-sex group
        const groupedAmount = Object.keys(nutrientData).reduce((obj, ageSexGroup) => {
            obj[ageSexGroup] = Object.keys(nutrientData[ageSexGroup]).reduce((innerObj, foodLevelGroup) => {
                innerObj[foodLevelGroup] = nutrientData[ageSexGroup][foodLevelGroup].reduce((amount, dataRow) => {
                    // we want only the overall amounts for each food group, so ignore the rows representing subgroups
                    return amount + (isNaN(dataRow[keyName]) || dataRow["Food group_level2"] || dataRow["Food group_level3"] ? 0 : dataRow[keyName])
                }, 0);
                return innerObj;
            }, {})
            maxAccumulatedAmount = Math.max(maxAccumulatedAmount, Object.values(obj[ageSexGroup]).reduce((sum, cur) => sum + cur, 0))
            return obj;
        }, {})  

        upperGraphYAxisScale.domain([0, type === "number" ? Math.round(maxAccumulatedAmount * 1.2 / 10) * 10 : 100])
        upperGraphYAxisLine.call(d3.axisLeft(upperGraphYAxisScale));
        upperGraphYAxisLabel.text(translateText(`upperGraph.${type}.yAxisTitle`, { nutrient, amountUnit: getNutrientUnit(nutrient) }))

        upperGraphBars.selectAll("g").remove();
        upperGraphBarHoverDetect.selectAll("g").remove();

        upperGraphTooltips.selectAll("g").remove();

        const barOnClick = (dt) => {
            /* Zooming in on a specific category */
            upperGraphTooltips.selectAll("g").remove();

            const category = dt[0];
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
                        drawUpperGraphStackedBars(upperGraphBars, d, xAxisTicks.nodes()[i].getAttribute("transform"), () => updateGraph(nutrient), i + 1)  
                )         
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
        upperGraphHeading.text(translateText(`upperGraph.${type}.graphTitle`, { nutrient, amountUnit: getNutrientUnit(nutrient)}))

        //draw the table
        drawTable(nutrient);

        // switch type button
        upperGraphSwitchTypeButton.text(translateText(`upperGraph.${type}.switchTypeButton`))
            .on("click", () => {
                graphType = typeIterator.next().value;
                updateGraph(nutrient);
            });
    }

    function drawUpperGraphStackedBars(element, groups, transform, onClick, mult) {
        const groupEntries = Object.entries(groups);
        //  sort the [food group, intake] pairs in decreasing order by intake
        groupEntries.sort((a, b) => b[1]- a[1]);
        let accumulatedHeight = dims.upperGraphHeight + dims.upperGraphTop;
        
        groupEntries.forEach((d, i) => hoverTooltip(d, mult * 100 + i));

        element.append("g")
            .attr("transform", transform)
            .selectAll("rect")
            .data(groupEntries)
            .enter()
            .append("rect")
                .attr("width", 100)                                     
                .attr("height", (d, i) => 
                    dims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]) + 
                    /* So that there arent gaps between bars due to rounding */
                    (i !== groupEntries.length - 1 ? 1 : 0)
                )
                .attr("x", -50)
                .attr("y", (d, i) => {
                    const scaledHeight = dims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]);
                    accumulatedHeight -= scaledHeight;
                    return (accumulatedHeight) - 
                        /* So that there arent gaps between bars due to rounding */
                        (i !== groupEntries.length - 1 ? 1 : 0);
                })
                .attr("fill", d => graphColours[d[0]]);
        
        accumulatedHeight = dims.upperGraphHeight + dims.upperGraphTop;
        upperGraphBarHoverDetect.append("g")
            .attr("transform", transform)
            .selectAll("rect")
            .data(groupEntries)
            .enter()
            .append("rect")
                .attr("width", 100)                                     
                .attr("height", (d, i) => 
                    dims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]) + 
                    /* So that there arent gaps between bars due to rounding */
                    (i !== groupEntries.length - 1 ? 1 : 0)
                )
                .attr("x", -50)
                .attr("y", (d, i) => {
                    const scaledHeight = dims.upperGraphHeight - upperGraphYAxisScale(isNaN(d[1]) ? 0 : d[1]);
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

    function onBarHover(d, i){
        console.log(d)
        updateInfoBox(d);

        const mousePos = d3.mouse(upperGraphSvg.node());
        console.log(mousePos)
        console.log(d3.select(`#barHover${i}`));
        const element = d3.select(`#barHover${i}`);

        if (element.attr("opacity") === "0") {
            element.attr("opacity", 1);
        }

        element.attr("transform", `translate(${mousePos[0]}, ${mousePos[1]})`);

    }

    function onBarUnHover(d, i){
        d3.select(`#barHover${i}`).attr("opacity", 0);
    }


    function hoverTooltip(d, i){
        console.log("HOVERETOTOOTKSDL")
        const colour = graphColours[d[0]];
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
            
            const lines = translateText("upperGraph.infoBox", { 
                returnObjects: true, 
                context: graphType,
                amount: d[1],
                name: d[0]
            });
            
            let width = dims.upperGraphTooltipMinWidth;
            lines.map((line, lineNum) => {
                const text = card.append("text")
                    .attr("x", 10)
                    .attr("y", (lineNum + 1) * 10)
                    .attr("font-size", dims.upperGraphInfoBoxFontSize)
                    .text(line);
                width = Math.max(text.node().getComputedTextLength() + 20, width);
            })
            cardRect.attr("width", width);
    }

    function updateInfoBox(d){
        upperGraphInfoBoxRect.attr("stroke", graphColours[d[0]]);
        const desc = foodGroupDescriptions[d[0]]["Description of the Contents of the Food Groups and Sub-groups"];
        let numLines = [];
        upperGraphInfoBoxText.selectAll("tspan").remove();
        splitTextWidth(upperGraphInfoBoxText, desc, dims.upperGraphInfoBoxWidth - 6, dims.upperGraphInfoBoxFontSize, 3 - dims.upperGraphInfoBoxWidth / 2, 3, numLines);
    }

    function drawTable(nutrient){
        
        const nutrientData = data[nutrient];
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
        upperGraphTableHeading.selectAll("tr").remove();
        upperGraphTableHeading.append("tr")
            .selectAll("th")
            .data(["", ...ageSexGroupHeadings.filter(g => nutrientAgeGroups.includes(g))])
            .enter()
            .append("th")
                .attr("class", "text-center")
                .style("border-left", (d, i) => i === 0 ? "" : dims.tableSectionBorderLeft)
                .style("border-bottom", (d, i) => i === 0 ? "0px" : dims.tableSectionBorderLeft)
                .attr("colspan", (d, i) => i === 0 ? 1 : headingsPerSexAgeGroup.length)
                .text(d => translateText(d));

        const subHeadingColumns = Object.keys(nutrientData).map(() => headingsPerSexAgeGroup).flat();
        upperGraphTableHeading.append("tr")
            .selectAll("td")
            .data([""].concat(subHeadingColumns))
            .enter()
            .append("td")
                .style("min-width", (d, i) => i === 0 ? "200px" : "40px")
                .style("border-left", (d, i) => (i + 1) % 4 === 2 ? dims.tableSectionBorderLeft : "")
                .style("border-top", "0px")
                .attr("colspan", 1)
                .text(d => translateText(d))
        
        upperGraphTableBody.selectAll("tr").remove();
        const tableRows = {};
        
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
                    .style("border-left", (d, i) => (i + 1) % 4 === 2 ? dims.tableSectionBorderLeft : "");
        });

        upperGraphTableTitle.text(translateText("upperGraph.tableTitle", { amountUnit: getNutrientUnit(nutrient), nutrient }))
    }

    function drawGraphLegend(element, titleToColours){
        Object.entries(titleToColours).forEach((entry, i) => {
            const [title, colour] = entry;
            const groupElement = element.append("g");
            groupElement.append("rect")
                .attr("y", i * dims.legendRowHeight + (dims.legendRowHeight - dims.legendSquareSize ) / 2)
                .attr("width", dims.legendSquareSize)
                .attr("height", dims.legendSquareSize)
                .attr("fill", colour)
                .on("mouseenter", () => updateInfoBox([title, 0]));
            groupElement.append("text")
                .attr("y", (i) * dims.legendRowHeight + dims.legendFontSize * 0.8 + (dims.legendRowHeight - dims.legendFontSize ) / 2)
                .attr("x", 25)
                .attr("font-size", dims.legendFontSize)
                .text(translateText(title))
                .on("mouseenter", () => updateInfoBox([title, 0]));    
                
        })
    }

    function getNutrientUnit(nutrient){
        return Object.values(Object.values(data[nutrient])[0])[0][0]["Unit"];
    }

    function *getGraphType(){
        while(true){
            yield "number";
            yield "percentage";
        }
    }
}

function lowerGraph(data, foodGroupDescriptions, tableData){

            // Specify the chart’s dimensions.
    const width = dims.lowerGraphLeft + dims.lowerGraphWidth + dims.lowerGraphRight;
    const height = dims.lowerGraphTop + dims.lowerGraphHeight + dims.lowerGraphBottom;
    const radius = dims.lowerGraphArcRadius;

    const ageSexSelector = d3.select("#lowerGraphAgeSexSelect");

    const lowerGraphSvg = d3.select("#lowerGraph").append("svg")
        .attr("overflow", "visible")
        .attr("width", width)
        .attr("height", height)
        //.attr("viewBox", [-width, -height / 2, width, width])
        .style("font", "10px sans-serif");

    const lowerGraphChartHeading = lowerGraphSvg.append("g")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", dims.lowerGraphChartHeadingFontSize)
        .attr("x", width / 2)
        .attr("y", dims.lowerGraphTop - dims.lowerGraphChartHeadingFontSize * 0.75);
    
    const lowerGraphSunburst = lowerGraphSvg.append("g")
        .attr("transform", `translate(${dims.lowerGraphLeft + dims.lowerGraphWidth / 2}, ${dims.lowerGraphTop + dims.lowerGraphHeight / 2})`)

    const lowerGraphFilterGroupsButton = d3.select("#lowerGraphFilterGroupsButton");

    const lowerGraphInfoBox = lowerGraphSvg.append("g")
        .attr("transform", `translate(${dims.lowerGraphLeft + dims.lowerGraphWidth},${dims.lowerGraphTop + dims.lowerGraphHeight - dims.lowerGraphInfoBoxHeight})`);

    const lowerGraphInfoBoxRect = lowerGraphInfoBox.append("rect")
        .attr("stroke", "grey")
        .attr("fill", "none")
        .attr("width", dims.lowerGraphInfoBoxWidth)
        .attr("height", dims.lowerGraphInfoBoxHeight)
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
    const lowerGraphInfoBoxText = lowerGraphInfoBox.append("text")
        .attr("font-size", dims.lowerGraphInfoBoxFontSize);

    const lowerGraphTable = d3.select("#lowerGraphTable");
    const lowerGraphTableHeading = lowerGraphTable.append("thead");
    const lowerGraphTableBody = lowerGraphTable.append("tbody");
    const lowerGraphTableTitle = d3.select("#lowerGraphTableTitle");

    async function drawGraph(nutrient){
        ageSexSelector.on("change", () => drawGraph(nutrient))
            .selectAll("option")
            .data(Object.keys(data[nutrient]))
            .enter()
            .append("option")
                .property("value", d => d)
                .text(d => d);
        
        const ageSexGroup = getSelector("#lowerGraphAgeSexSelect");
        lowerGraphChartHeading.text(translateText("lowerGraph.graphTitle", {
            nutrient,
            ageSexGroup
        }));

        drawSunburst(nutrient, ageSexGroup);
        drawTable(nutrient, ageSexGroup);
    }
    
    // Source: https://observablehq.com/@d3/zoomable-sunburst
    function drawSunburst(nutrient, ageSexGroup){

        lowerGraphSunburst.selectAll("g").remove();

        const nutrientData = data[nutrient];
        const groupedPercentages = Object.keys(nutrientData[ageSexGroup]).reduce((objLevel1, foodLevel1) => {
            const foodLevel1Group = nutrientData[ageSexGroup][foodLevel1];
            objLevel1.children.push(Object.keys(nutrientData[ageSexGroup][foodLevel1]).filter(d => d).reduce((objLevel2, foodLevel2) => {
                const foodLevel2Group = foodLevel1Group[foodLevel2];
                objLevel2.value -= foodLevel2Group[""]["Amount"];
                const newChild = {
                    name: foodLevel2,
                    value: foodLevel2Group[""]["Amount"],
                    row: foodLevel2Group[""]
                };
                newChild.children = Object.keys(foodLevel2Group).filter(d => d).map((foodLevel3) => {
                    const foodLevel3Group = foodLevel2Group[foodLevel3];
                    newChild.value -= foodLevel3Group["Amount"];
                    return {
                        name: foodLevel3,
                        value: foodLevel3Group["Amount"],
                        row: foodLevel3Group
                    }
                })
                objLevel2.children.push(newChild);
                return objLevel2;
            }, { 
                name: foodLevel1, 
                value: foodLevel1Group[""][""]["Amount"], 
                row: foodLevel1Group[""][""], 
                children: []
            }));
            return objLevel1;
        }, { name: "data", children: []});

        // Compute the layout.
        const hierarchy = d3.hierarchy(groupedPercentages)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        const root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1])
            (hierarchy);
        root.each(d => d.current = d);

        // Create the arc generator.
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
        
        // Append the arcs.
        const path = lowerGraphSunburst.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return graphColours[d.data.name]; })
            .attr("fill-opacity", d => arcVisible(d.current) ? 1 : 0)
            .property("id", (d, i) => `arcPath${i}`)
            .attr("d", d => arc(d.current))

        const format = d3.format(",d");
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

        const label = lowerGraphSunburst.append("g")
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", radius / 2)
            .attr("font-size", dims.lowerGraphArcLabelFontSize)
            .attr("fill-opacity", d => +labelVisible(d.current))
                .append("textPath")
                .attr("id", (d, i) => `arcLabel${i}`)
                .attr("href", (d, i) => `#arcPath${i}`);
        
        label.each(labelTextFit);


        const parent = lowerGraphSunburst.append("circle")
            .datum(root.descendants())
            .attr("r", radius)
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
        
        // Make them clickable if they have children.
        hoverPath.style("cursor", "pointer")
            .on("click", (e, i) => {
                if (root.descendants().slice(1)[i].children) clicked(e,i + 1);
            });

        hoverPath.on("mousemove", arcHover);
        hoverPath.on("mouseenter", arcHover);
        hoverPath.on("mouseover", arcHover);
        hoverPath.on("mouseout", arcUnHover);
        
        filterAllFoodGroups();

        function arcHover(d, i){
            d3.select(`#arcHover${i}`).attr("opacity", 1);
            updateInfoBox(d);
        }
        function arcUnHover(d, i){
            d3.select(`#arcHover${i}`).attr("opacity", 0);
        }

        function filterAllFoodGroups(){
            root.each(d => d.target = {
                depth: d.depth,
                data: d.data,
                value: d.value,
                x0: d.x0,
                x1: d.x1,
                y0: d.y0,
                y1: d.y1,
            });
            transitionArcs(0);
            lowerGraphFilterGroupsButton.text(translateText("lowerGraph.seeLevel2Groups"));
            lowerGraphFilterGroupsButton.on("click", filterOnLevel2Groups)
        }
        function filterOnLevel2Groups(){
            let acc = 0;
            const sortedGroups = root.descendants().slice(1).sort((a, b) => d3.descending(a.value, b.value));
            sortedGroups.forEach((d, i) => {
                root.descendants().find(r => r.data.name === d.data.name).target = {
                    depth: d.depth,
                    data: d.data,
                    value: d.value,
                    x0: d.depth === 2 ? acc : 0,
                    x1: d.depth === 2 ? acc + (d.x1 - d.x0) : 0,
                    y0: d.y0,
                    y1: d.y1
                }
                acc += d.depth === 2 ? (d.x1 - d.x0) : 0;
            });
            transitionArcs(0);
            lowerGraphFilterGroupsButton.text(translateText("lowerGraph.seeAllGroups"));
            lowerGraphFilterGroupsButton.on("click", filterAllFoodGroups);
        }
        // Handle zoom on click.
        function clicked(event, i) {

            const children = root.descendants();
            parent.datum(children[i] ?? root);
            //const p = children[i] ? children[i].parent ?? children[i] : children
            const p = children[i] ?? children;

            /* Transition only if the clicked arc does not already span a full circle */
            if (!p.target || (p.target.x1 - p.target.x0) < 2 * Math.PI) {
                root.each(d => {
                    if (d.data.row)
                        d.target = {
                            depth: d.depth,
                            data: d.data,
                            value: d.value,
                            x0: d.value && d == p || (d.children && d.children.find(r => p == r)) ? 0 : p.data.row["Food group_level1"] == d.data.row["Food group_level1"] ? Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI : 0,
                            x1: d.value && d == p || (d.children && d.children.find(r => p == r)) ? 2 * Math.PI : p.data.row["Food group_level1"] == d.data.row["Food group_level1"] ? Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI : 0,
                            y0: d.y0,
                            y1: d.y1
                        }
                });
    
                transitionArcs();
            }
        }

        function transitionArcs(duration = 750){
            const t = lowerGraphSunburst.transition().duration(duration);
            const s = lowerGraphSunburst.transition().duration(duration * 1.5);

            label.attr("href", (d, i) => arcVisible(d.target) ? `#arcPath${i}` : "none" )
                .call((d) => d.attr("fill-opacity", 0))
                .each((d, i) => labelTextFit(d.target, i));

            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(s)
                .attr("fill-opacity", (d) => +arcVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.each((d,i) => positionHoverCard(d3.select(`#arcHover${i}`), d.target))
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

        function arcVisible(d) {
            return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
        }

        function labelVisible(d) {
            return d.x1 - d.x0 > 0.05
        }

        function labelTransform() {
            return `translate(${30},0)`;
        }

        function labelAvailableLength(d){
            const outerRadius = d.y1 * radius;
            const angle = d.x1 - d.x0;
            const arcLength = outerRadius * angle;
            return arcLength;
        }

        function labelTextFit(d, i){
            const element = d3.select(`#arcLabel${i}`);
            if (!element.node()) return;
            const elementNode = element.node();
            const availableLength = labelAvailableLength(d); 
            let text = d.data.name;
            element.text(text);
            let textLength = elementNode.getComputedTextLength();

            while (textLength > availableLength && text){
                text = text.slice(0, text.length - 1);
                element.text(`${text}...`);
                textLength = elementNode.getComputedTextLength();
            }
        }

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
            
            const lines = translateText("lowerGraph.infoBoxLevel", { 
                returnObjects: true, 
                context: d.depth,
                name: d.data.name,
                percentage: d.data.row.Percentage,
                parentGroup: d.depth > 1 ? d.parent.data.name : "",
                parentPercentage: d.depth > 1 ? Math.round(d.data.row.Percentage / d.parent.data.row.Percentage * 1000) / 10 : 0,
                nutrient
            });
            
            let width = dims.lowerGraphTooltipMinWidth;
            lines.map((line, lineNum) => {
                const text = card.append("text")
                    .attr("x", 10)
                    .attr("y", (lineNum + 1) * 10)
                    .text(line);
                width = Math.max(text.node().getComputedTextLength() + 20, width);
            })
            cardRect.attr("width", width);

            positionHoverCard(card, d);
        }

        function positionHoverCard(element, d){
            const relativeAngle = (d.x1 + d.x0)/2 + 3 * Math.PI / 2;
            element.attr("transform", `translate(${dims.lowerGraphArcRadius * Math.cos(relativeAngle) * (d.depth + 1)}, ${dims.lowerGraphArcRadius * Math.sin(relativeAngle) * (d.depth)})`);
        }

        function updateInfoBox(d){
            lowerGraphInfoBoxRect.attr("stroke", graphColours[d.data.row["Food group_level1"]]);
            lowerGraphInfoBoxText.selectAll("tspan").remove();
            let numLines = [];
            splitTextWidth(lowerGraphInfoBoxText, foodGroupDescriptions[d.data.name]["Description of the Contents of the Food Groups and Sub-groups"], 
                dims.lowerGraphInfoBoxWidth - 6, dims.lowerGraphInfoBoxFontSize, 3 - dims.lowerGraphInfoBoxWidth / 2, 3, numLines
            );
        }

    }

    function drawTable(nutrient, ageSexGroup){
        const nutrientTableData = tableData[nutrient][ageSexGroup];
        /** TODO: Create the lower graph table here **/
    }

    return drawGraph;
}

function splitTextWidth(textElement, text, width, fontSize, x, y, numLines = [0]){
    const words = text ? text.split(" ") : textElement.text().split(" ");
        words.reduce((arr, word) => {
            let textNode = arr[arr.length - 1];
            let line = textNode.text().split(" ");
            line.push(word);
            textNode.text(line.join(" "))
            if (textNode.node().getComputedTextLength() > width) {
                line.pop();
                textNode.text(line.join(" "));
                textNode = textElement.append("tspan")
                    .attr("y", y + (arr.length + 1) * fontSize)
                    .attr("x", x + width / 2)
                    .text(word);
                arr.push(textNode);
                numLines[0]++;
                numLines.push(textNode.text().length)
            } else {
                textNode.text(line.join(" "));
                arr[arr.length - 1] = textNode;
            }
            return arr;
        }, [textElement.append("tspan").attr("x", x + width / 2).attr("y", y + fontSize)])  
        numLines[0]++; 
        numLines.push(words.pop().length)
}  