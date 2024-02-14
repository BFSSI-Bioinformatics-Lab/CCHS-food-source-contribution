////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// Purpose: Used to define any data classes for storing backend                                   //
//      data or state information                                                                 //
//                                                                                                //
// What it contains:                                                                              //
//      CSVDataModel: a wrapper for handling any CSV data                                         //
//               - contains the raw table related to its corresponding CSV file                   //
//                                                                                                //
//      FoodDescriptionDataModel: class for handling all the needed data related to               //
//          'Food Group descriptions.csv'                                                         //
//               - has the raw for its CSV file                                                   //
//                                                                                                //
//      FoodIngredientDataModel: class for handling all the needed                                //
//          data related to the 'FSCT data_Food_ingredients CCHS 2015 all nutrients_Infobase.csv' //
//                - has the raw table for its CSV file                                            //
//                - creates the data needed for the tables of                                     //
//                      bargraph and the sunburst                                                 //
//                - creates the tree needed for sunburst visual                                   //
//                - gets all the nutrients for the nutrient dropdown                              //
//                - creates the data needed for the age-sex group dropdown and the x-axis of      //
//                      of the bar graph                                                          //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////


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


// ================== DATA CLASSES =======================================
// =======================================================================


// CSVDataModel: Data model for importing data from CSV files
export class CSVDataModel {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = [];
    }

    // load(): loads the data from the CSV file
    async load() {
        this.data = await d3.csv(this.filePath);
    }
}


// FoodDescriptionDataModel: Data model for the food description data in the CSV file
export class FoodDescriptionDataModel extends CSVDataModel {
    constructor(filePath) {
        super(filePath);
    }

    // load(): loads the data from the CSV file
    async load() {
        await super.load();
        this.data = TableTools.numToFloat(this.data);
    
        this.data = Object.freeze(d3.nest()
                          .key(d => 
                                Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv3]) ? 
                                    Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv2]) ? 
                                        d[FoodGroupDescDataColNames.foodGroupLv1]
                                        : d[FoodGroupDescDataColNames.foodGroupLv2]
                                    : d[FoodGroupDescDataColNames.foodGroupLv3]
                            )
                            .rollup(d => d[0])
                            .object(this.data)); 
    }
}


// FoodIngredientDataModel: Data model for the food ingredient data in the CSV file
export class FoodIngredientDataModel extends CSVDataModel {
    constructor(filePath, dataGroupedByNutrientAndDemoList, dataGroupedByNutrientAndDemo, fullyNestedDataByFoodGroup) {
        super(filePath);
        this.dataGroupedByNutrientAndDemoList = dataGroupedByNutrientAndDemoList;
        this.dataGroupedByNutrientAndDemo = dataGroupedByNutrientAndDemo;
        this.fullyNestedDataByFoodGroup = fullyNestedDataByFoodGroup;

        this.ageSexGroupHeadings = SortedAgeSexGroupHeadings;
    }

    // load(): Loads the data from the CSV file
    async load() {
        await super.load();
        this.data = TableTools.numToFloat(this.data);

        this.dataGroupedByNutrientAndDemoList = Object.freeze(d3.nest()
                                        .key(d => d.Nutrient)
                                        .key(d => d[NutrientDataColNames.ageSexGroup])
                                        .object(this.data));

        this.dataGroupedByNutrientAndDemo = Object.freeze(d3.nest()
                                        .key(d => d.Nutrient)
                                        .key(d => d[NutrientDataColNames.ageSexGroup])
                                        .key(d => d[NutrientDataColNames.foodGroupLv1])
                                        .object(this.data));

        this.fullyNestedDataByFoodGroup = Object.freeze(d3.nest()
                                            .key(d => d.Nutrient)
                                            .key(d => d[NutrientDataColNames.ageSexGroup])
                                            .key(d => d[NutrientDataColNames.foodGroupLv1])
                                            .key(d => Number.isNaN(d[NutrientDataColNames.foodGroupLv2]) ? "" : d[NutrientDataColNames.foodGroupLv2] )
                                            .key(d => Number.isNaN(d[NutrientDataColNames.foodGroupLv3]) ? "" : d[NutrientDataColNames.foodGroupLv3] )
                                            .rollup(d => d[0])
                                            .object(this.data));
    }

    getNutrientData(nutrient) {
        return this.dataGroupedByNutrientAndDemo[nutrient];
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
        const nutrientData = this.fullyNestedDataByFoodGroup[nutrient];

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


// =======================================================================