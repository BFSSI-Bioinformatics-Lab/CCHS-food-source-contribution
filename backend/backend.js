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


import { AgeSexGroupOrder, FoodGroupDescDataColNames, NutrientDataColNames } from "../assets/assets.js";


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
}

// =======================================================================
// ================== MODEL ==============================================

// Model: The overall model for the user interface
export class Model {
    constructor(foodDescriptionFilePath, foodIngredientFilePath) {
        // file paths to the CSV files
        this.foodDescriptionFilePath = foodDescriptionFilePath;
        this.foodIngredientFilePath = foodIngredientFilePath;

        // --- different stored data  used in the UI ----

        this.nutrient = "";
        this.foodGroupDescriptionData = {};

        this.nutrientTable = [];
        this.nutrientTablesByDemo = {};
        this.nutrientTablesByDemoGroupLv1 = {};
        this.nutrientTablesFullyNestedDataByFoodGroup = {};

        this.ageSexGroupHeadings = SortedAgeSexGroupHeadings;

        // ----------------------------------------------
    }

    // load(): Setup all the needed data for the user interface
    async load() {
        return await Promise.all([this.loadFoodGroupDescriptionData(), this.loadFoodIngredientsData()]);
    }

    // loadFoodGroupDescriptionData(): Load the data for all the food group descriptions
    async loadFoodGroupDescriptionData() {
        let data = await d3.csv(this.foodDescriptionFilePath);
        data = TableTools.numToFloat(data);
    
        data = Object.freeze(d3.nest()
                .key(d => 
                        Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv3]) ? 
                            Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv2]) ? 
                                d[FoodGroupDescDataColNames.foodGroupLv1]
                                : d[FoodGroupDescDataColNames.foodGroupLv2]
                            : d[FoodGroupDescDataColNames.foodGroupLv3]
                    )
                    .rollup(d => d[0])
                    .object(data));
        
        this.foodGroupDescriptionData = data;
        return data;
    }

    // loadFoodIngredientsData(): Load the data for all the food ingredients
    async loadFoodIngredientsData(){
        let data = await d3.csv(this.foodIngredientFilePath);
        data = TableTools.numToFloat(data);

        this.nutrientTablesByDemo = Object.freeze(d3.nest()
                                        .key(d => d.Nutrient)
                                        .key(d => d[NutrientDataColNames.ageSexGroup])
                                        .object(data));

        this.nutrientTablesByDemoGroupLv1 = Object.freeze(d3.nest()
                                                .key(d => d.Nutrient)
                                                .key(d => d[NutrientDataColNames.ageSexGroup])
                                                .key(d => d[NutrientDataColNames.foodGroupLv1])
                                                .object(data));

        this.nutrientTablesFullyNestedDataByFoodGroup = Object.freeze(d3.nest()
                                                            .key(d => d.Nutrient)
                                                            .key(d => d[NutrientDataColNames.ageSexGroup])
                                                            .key(d => d[NutrientDataColNames.foodGroupLv1])
                                                            .key(d => Number.isNaN(d[NutrientDataColNames.foodGroupLv2]) ? "" : d[NutrientDataColNames.foodGroupLv2] )
                                                            .key(d => Number.isNaN(d[NutrientDataColNames.foodGroupLv3]) ? "" : d[NutrientDataColNames.foodGroupLv3] )
                                                            .rollup(d => d[0])
                                                            .object(data));

        this.nutrientTablesByDemo = data;
    }


    // calculate the total amount by nutrient per age-sex group
    findNutrientTotalAmtPerAgeSexGroup(nutrientData, graphType) {
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


    // buildSunBurstTree(nutrient, ageSexGroup): Build the tree needed for the data of the sun burst graph
    buildSunBurstTree(nutrient, ageSexGroup) {
        const nutrientData = this.nutrientTablesFullyNestedDataByFoodGroup[nutrient];

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
}