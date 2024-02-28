////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// Purpose: Handles the overall backend of the website                                //
//                                                                                    //
// What it contains:                                                                  //
//      - which nutrient is being selected in the nutrient dropdown                   //
//      - has the raw table for the CSV files                                         //
//      - creates the data needed for the tables of                                   //
//          bargraph and the sunburst                                                 //
//      - creates the tree needed for sunburst visual                                 //
//      - gets all the nutrients for the nutrient dropdown                            //
//      - creates the data needed for the age-sex group dropdown and the x-axis of    //
//          of the bar graph                                                          //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////


import { AgeSexGroupOrder, FoodGroupDescDataColNames, FoodIngredientDataColNames, FoodDescriptionExceptionKeys } from "./assets.js";


// ================== CONSTANTS ==========================================

const SortedAgeSexGroupHeadings = Object.keys(AgeSexGroupOrder).sort((a,b) => {return AgeSexGroupOrder[a] - AgeSexGroupOrder[b]});


// =======================================================================
// ================== TOOLS/UTILITIES ====================================

// TableTools: Class for handling any table-like data ex. list of lists/matrices, list of dictionaries
//    dictionaries of dictionaries, dictionaries of lists, etc...
export class TableTools {

    // numToFloat(data): convert all numeric fields into floats
    // Contract: data: List[Dict[str, Any]]
    static numToFloat(data) {
        data.forEach(d => {
            Object.keys(d).forEach(key => d[key] = isNaN(d[key]) ? d[key] : parseFloat(d[key]))
        });

        return data;
    }

    // createCSVContent(matrix, numOfCols): Creates the string needed for exporting to CSV
    // Note: This part replaces JQuery in the html doc of the original (lines 671-689 with its nested .find functions)
    //  git commit hash: 58aaf7a62118cdcd7e7364cbe3f6959a825a862b
    static createCSVContent(matrix) {
        let result = "";
        for (const row of matrix) {
            const colLen = row.length;
            const csvRow = [];

            // clean up the text for each cell
            for (let i = 0; i < colLen; ++i) {
                let cleanedText = `${row[i]}`.replace(/"/g, '\\"').replace(/'/g, "\\'");
                cleanedText = `"${cleanedText}"`;
                csvRow.push(cleanedText);
            }

            result += csvRow.join(",") + "\r\n";
        }

        return result;
    }
}

// =======================================================================
// ================== MODEL ==============================================

// Model: The overall model for the user interface
export class Model {
    static ageSexGroupHeadings = SortedAgeSexGroupHeadings;

    // load(): Setup all the needed data for the user interface
    async load() {
        return await Promise.all([this.loadFoodGroupDescriptionData(), this.loadGraphFoodIngredientsData(), this.loadTableFoodIngredientsData()]);
    }

    // loadFoodGroupDescriptionData(): Load the data for all the food group descriptions
    async loadFoodGroupDescriptionData() {
        let data = await d3.csv("data/Food Group descriptions.csv");
        data = TableTools.numToFloat(data);
    
        this.foodGroupDescriptionData = Object.freeze(d3.nest()
                .key(d => 
                        (Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv3]) ? 
                            Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv2]) ? 
                                d[FoodGroupDescDataColNames.foodGroupLv1]
                                : d[FoodGroupDescDataColNames.foodGroupLv2]
                            : d[FoodGroupDescDataColNames.foodGroupLv3]).trim()
                    )
                    .rollup(d => d[0])
                    .object(data));

        return this.foodGroupDescriptionData;
    }

    // loadGraphFoodIngredientsData(): Load the data for all the food ingredients used in the graphs
    async loadGraphFoodIngredientsData(){
        let data = await d3.csv("data/GRAPH_FSCT-data_Food_ingredients CCHS 2015-20240126.csv");
        data = TableTools.numToFloat(data);

        this.graphNutrientTablesByDemoGroupLv1 = Object.freeze(d3.nest()
                                                .key(d => d.Nutrient)
                                                .key(d => d[FoodIngredientDataColNames.ageSexGroup].trim())
                                                .key(d => d[FoodIngredientDataColNames.foodGroupLv1].trim())
                                                .object(data));

        this.graphNutrientTablesFullyNestedDataByFoodGroup = Object.freeze(d3.nest()
                                                            .key(d => d.Nutrient)
                                                            .key(d => d[FoodIngredientDataColNames.ageSexGroup].trim())
                                                            .key(d => d[FoodIngredientDataColNames.foodGroupLv1].trim())
                                                            .key(d => Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv2]) ? "" : d[FoodIngredientDataColNames.foodGroupLv2].trim() )
                                                            .key(d => Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv3]) ? "" : d[FoodIngredientDataColNames.foodGroupLv3].trim() )
                                                            .rollup(d => d[0])
                                                            .object(data));

        return [this.graphNutrientTablesByDemoGroupLv1, this.graphNutrientTablesFullyNestedDataByFoodGroup];
    }

    // loadTableFoodIngredientsData(): Load the data for all the food ingredients used in the tables
    async loadTableFoodIngredientsData() {
        let data = await d3.csv("data/TABLE_FSCT-data_Food_ingredients CCHS 2015-20240126.csv");
        data = TableTools.numToFloat(data);

        this.tableNutrientTablesByDemoGroupLv1 = Object.freeze(d3.nest()
            .key(d => d.Nutrient)
            .key(d => d[FoodIngredientDataColNames.ageSexGroup].trim())
            .key(d => d[FoodIngredientDataColNames.foodGroupLv1].trim())
            .object(data));

        return this.tableNutrientTablesByDemoGroupLv1;
    }

    // getInterpretationValue(interpretationValue): Retrieves the interpretation value to be displayed
    //  in the table of the visual's
    static getInterpretationValue(interpretationValue) {
        return interpretationValue == "<10" ? "X" : interpretationValue;
    }

    // calculate the total amount by nutrient per age-sex group
    static findNutrientTotalAmtPerAgeSexGroup(nutrientData, graphType) {
        let maxAccumulatedAmount = 0;

        /* If graph type is number, get data from "Amount" col, otherwise use "Percentage" */
        const keyName = graphType === "number" ? "Amount" : "Percentage"

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

        return {"groupedAmount": groupedAmount, "maxAccumulatedAmount": maxAccumulatedAmount};
    }

    // getFoodDescription(nutrient, foodGroup): Retrieves the corresponding food description for 'foodGroup' and 'nutrient'
    getFoodDescription(nutrient, foodGroup) {
        foodGroup = foodGroup.trim();
        if (FoodDescriptionExceptionKeys[foodGroup] === undefined) {
            return this.foodGroupDescriptionData[foodGroup][FoodGroupDescDataColNames.description];
        }

        // descriptions that depend whether the nutrient is sodium or not
        if (nutrient != "Sodium") {
            nutrient = "OtherNutrients";
        }

        const foodDescriptionKey = FoodDescriptionExceptionKeys[foodGroup][nutrient];
        return this.foodGroupDescriptionData[foodDescriptionKey][FoodGroupDescDataColNames.description];
    }

    // buildSunBurstTree(nutrient, ageSexGroup): Build the tree needed for the data of the sun burst graph
    buildSunBurstTree(nutrient, ageSexGroup) {
        const nutrientData = this.graphNutrientTablesFullyNestedDataByFoodGroup[nutrient];

        /* Group data into a tree where each node has the form of { name, value, row, children } for d3.hierarchy() */
        let groupedPercentages = Object.keys(nutrientData[ageSexGroup]).reduce((objLevel1, foodLevel1) => {
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
                value: foodLevel1Group[""][""]["Amount"], // key "" represents the overall group including all subgroups
                row: foodLevel1Group[""][""], 
                children: []
            }));
            return objLevel1;
        }, { name: "All Items", row: {Percentage: 100}, children: [] });

        groupedPercentages = {name: "data", children: [groupedPercentages]}
        return groupedPercentages;
    }

    // createBarGraphTable(): Creates the data for the table of the bar graph
    createBarGraphTable() {
        const nutrientData = this.tableNutrientTablesByDemoGroupLv1[this.nutrient];
        const ageSexGroupHeadings = Model.ageSexGroupHeadings;
        const headingsPerSexAgeGroup = ["Amount (g)", "Amount SE", "% of total intake", "% SE"];
        const headingsPerSexAgeGroupKeys = [FoodIngredientDataColNames.amount, FoodIngredientDataColNames.amountSE, FoodIngredientDataColNames.percentage, FoodIngredientDataColNames.percentageSE];

        const nutrientAgeGroups = Object.keys(nutrientData);

        // headings for the top most level of the table
        const tableHeadings = ["", ...ageSexGroupHeadings.filter(g => nutrientAgeGroups.includes(g))];

        // sub-headings of the table
        const subHeadings = [""].concat(Object.keys(nutrientData).map(() => headingsPerSexAgeGroup).flat());

        // Get the rows needed for the table
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

        // Retrieve the specific value for each row
        const result = [];
        Object.entries(tableRows).forEach(([foodLevelGroup, d]) => {
            result.push([foodLevelGroup].concat(d.map(g => headingsPerSexAgeGroupKeys.map(key => Number.isNaN(g[key]) ? Model.getInterpretationValue(g["Interpretation_Notes"]) : g[key])).flat()));
        });

        // ------ this part used to be the JQuery part in the html doc of the original code -------
        //      git commit hash: 58aaf7a62118cdcd7e7364cbe3f6959a825a862b

        // get the text neeeded for the CSV export
        let csvHeadings = tableHeadings.map((ageSexGroup) => {
            const result = headingsPerSexAgeGroup.map(heading => "");
            result[0] = ageSexGroup;
            return result;
        });
        csvHeadings.shift();
        csvHeadings = csvHeadings.flat();
        csvHeadings.splice(0, 0, "");

        const csvContent = TableTools.createCSVContent([csvHeadings, subHeadings].concat(result), 1 + tableHeadings.length * headingsPerSexAgeGroup.length);

        // -----------------------------------------------------------------------------------------

        this.barGraphTable = { headings: tableHeadings, subHeadings, table: result, headingsPerSexAgeGroup, csvContent};
        return this.barGraphTable;
    }

    // createSunburstTable(ageSexGroup): Creates the data for the table of the sunburst graph
    createSunburstTable(ageSexGroup) {
        const nutrientData = this.tableNutrientTablesByDemoGroupLv1[this.nutrient][ageSexGroup];
        const tableHeadings = ["Food Group Level 1", "Food Group Level 2", "Food Group Level 3", "Amount (g)", "Amount SE", "% of total intake", "% SE"];
        const headingsPerSexAgeGroupKeys = [FoodIngredientDataColNames.amount, FoodIngredientDataColNames.amountSE, FoodIngredientDataColNames.percentage, FoodIngredientDataColNames.percentageSE];

        // append the rows for the table
        let result = [];
        for (const foodGroup in nutrientData) {
            result = result.concat(nutrientData[foodGroup]);
        }

        // get the specific values for each row
        result = result.map((row) => {
            let foodGroupData = [row["Food group_level1"], row["Food group_level2"], row["Food group_level3"]];
            foodGroupData = foodGroupData.map(foodGroupLv => Number.isNaN(foodGroupLv) ? "" : foodGroupLv);

            const amountData = headingsPerSexAgeGroupKeys.map(key => Number.isNaN(row[key]) ? Model.getInterpretationValue(row["Interpretation_Notes"]) : row[key]);
            return foodGroupData.concat(amountData);
        });

        // get the text needed for the CSV export
        const csvContent = TableTools.createCSVContent([tableHeadings].concat(result), tableHeadings.length);

        this.sunburstTable = { headings: tableHeadings, table: result, csvContent };
        return this.sunburstTable;
    }
}