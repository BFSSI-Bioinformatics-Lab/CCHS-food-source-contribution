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


import { AgeSexGroupOrder, Translation, FoodGroupDescDataColNames, FoodIngredientDataColNames, SunBurstStates, LowerGraphFoodGroupLv3ColInd, LowerGraphAllDataColInd } from "./assets.js";


// ================== CONSTANTS ==========================================

const SortedAgeSexGroupKeys = Object.keys(AgeSexGroupOrder).sort((a,b) => {return AgeSexGroupOrder[a] - AgeSexGroupOrder[b]});

const FoodGroupDepthToCol = {2 : FoodIngredientDataColNames.foodGroupLv1,
                             3 : FoodIngredientDataColNames.foodGroupLv2,
                             4 : FoodIngredientDataColNames.foodGroupLv3 }


// =======================================================================
// ================== TOOLS/UTILITIES ====================================

// SetTools: Class for handling with Sets
//     This class is mostly used to deal with compatibility issues with older browsers
//     since some of Javascript's Set functions are only recently implemented in 2023-2024
export class SetTools {

    // difference(set1, set2, newCopy): Computes the set difference of set1 - set2
    // Note:
    //  If 'newCopy' is set to false, the result for the set difference is stored
    //      back in 'set1'
    static difference(set1, set2, newCopy = false) {
        const result = newCopy ? new Set(set1) : set1;
        for (const element of set2) {
            result.delete(element);
        }

        return result;
    }
}

// DictTools: Class for handling dictionaries
export class DictTools {

    // invert(dict): Inverts a dictionary (keys become values and values become keys)
    static invert(dict) {
        return Object.fromEntries(Object.entries(dict).map(([key, value]) => [value, key]));
    }
}

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
                let cleanedText = `${row[i]}`.replace(/"/g, "'");
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

    // load(): Setup all the needed data for the user interface
    async load() {
        this.ageSexGroupHeadings = SortedAgeSexGroupKeys.map((ageSexKey) => Translation.translate(`AgeSexGroupHeadings.${ageSexKey}`));
        this.ageSexGroupHeadingKeys = DictTools.invert(Translation.translate("AgeSexGroupHeadings", { returnObjects: true }));

        this.foodDescExeceptions = Translation.translate("FoodDescriptionExceptionKeys", { returnObjects: true });

        let result = await Promise.all([this.loadFoodGroupDescriptionData(), this.loadGraphFoodIngredientsData(), this.loadTableFoodIngredientsData()]);
        await this.checkFoodGroupNames();
        return result
    }

    // loadFoodGroupDescriptionData(): Load the data for all the food group descriptions
    async loadFoodGroupDescriptionData() {
        let data = await d3.csv(`data/Food Group descriptions-${i18next.language}.csv`);
        data = TableTools.numToFloat(data);
    
        this.foodGroupDescriptionData = Object.freeze(d3.nest()
                .key(d => 
                        Model.cleanFoodGroupName((Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv3]) ? 
                            Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv2]) ? 
                                d[FoodGroupDescDataColNames.foodGroupLv1]
                                : d[FoodGroupDescDataColNames.foodGroupLv2]
                            : d[FoodGroupDescDataColNames.foodGroupLv3]))
                    )
                    .rollup(d => d[0])
                    .object(data));

        return this.foodGroupDescriptionData;
    }

    // loadGraphFoodIngredientsData(): Load the data for all the food ingredients used in the graphs
    async loadGraphFoodIngredientsData(){
        let data = await d3.csv(`data/Corrected_GRAPH_FSCT-data_Food_ingredients CCHS 2015-20240920-${i18next.language}.csv`);
        data = TableTools.numToFloat(data);

        this.graphNutrientTablesByDemoGroupLv1 = Object.freeze(d3.nest()
                                                .key(d => d.Nutrient)
                                                .key(d => d[FoodIngredientDataColNames.ageSexGroup].trim())
                                                .key(d => d[FoodIngredientDataColNames.foodGroupLv1].trim())
                                                .object(data));

        this.graphNutrientTablesFullyNestedDataByFoodGroup = Object.freeze(d3.nest()
                                                            .key(d => d.Nutrient)
                                                            .key(d => d[FoodIngredientDataColNames.ageSexGroup].trim())
                                                            .key(d => d[FoodIngredientDataColNames.foodGroupLv1].trim().toLowerCase())
                                                            .key(d => Model.cleanFoodGroupName(Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv2]) ? "" : d[FoodIngredientDataColNames.foodGroupLv2]))
                                                            .key(d => Model.cleanFoodGroupName(Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv3]) ? "" : d[FoodIngredientDataColNames.foodGroupLv3]))
                                                            .rollup(d => d[0])
                                                            .object(data));

        this.graphNutrientTablesByFoodGroups = Object.freeze(d3.nest()
        .key(d => 
                Model.cleanFoodGroupName((Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv3]) ? 
                    Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv2]) ? 
                        d[FoodIngredientDataColNames.foodGroupLv1]
                        : d[FoodIngredientDataColNames.foodGroupLv2]
                    : d[FoodIngredientDataColNames.foodGroupLv3]))
            )
            .rollup(d => d[0])
            .object(data));

        return [this.graphNutrientTablesByDemoGroupLv1, this.graphNutrientTablesFullyNestedDataByFoodGroup, this.graphNutrientTablesByFoodGroups];
    }

    // loadTableFoodIngredientsData(): Load the data for all the food ingredients used in the tables
    async loadTableFoodIngredientsData() {
        let data = await d3.csv(`data/Corrected_TABLE_FSCT-data_Food_ingredients CCHS 2015-20240624-${i18next.language}.csv`);
        data = TableTools.numToFloat(data);

        this.tableNutrientTables = Object.freeze(d3.nest()
            .key(d => d.Nutrient)
            .object(data));

        this.tableNutrientTablesByDemoGroupLv1 = Object.freeze(d3.nest()
            .key(d => d.Nutrient)
            .key(d => d[FoodIngredientDataColNames.ageSexGroup].trim())
            .key(d => Model.cleanFoodGroupName(d[FoodIngredientDataColNames.foodGroupLv1]))
            .object(data));

        this.tableNutrientTablesByFoodGroups = Object.freeze(d3.nest()
        .key(d => 
                Model.cleanFoodGroupName((Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv3]) ? 
                    Number.isNaN(d[FoodIngredientDataColNames.foodGroupLv2]) ? 
                        d[FoodIngredientDataColNames.foodGroupLv1]
                        : d[FoodIngredientDataColNames.foodGroupLv2]
                    : d[FoodIngredientDataColNames.foodGroupLv3]))
            )
            .rollup(d => d[0])
            .object(data));

        return [this.tableNutrientTables, this.tableNutrientTablesByDemoGroupLv1, this.tableNutrientTablesByFoodGroups];
    }

    // checkFoodGroupNames(): Check whether the food group names from the GRAPH and TABLE CSVs match the food group names given in the Food Group Description CSV
    async checkFoodGroupNames() {
        // exception food group names to not check
        let exceptionFoodGroupNames = new Set(Object.keys(this.foodDescExeceptions).map(foodGroupName => Model.cleanFoodGroupName(foodGroupName)));

        // get all the food group names from the CSV files
        let descFoodGroupNames = new Set(Object.keys(this.foodGroupDescriptionData));
        let badTableFoodGroupNames = new Set(Object.keys(this.tableNutrientTablesByFoodGroups));
        let badGraphFoodGroupNames = new Set(Object.keys(this.graphNutrientTablesByFoodGroups));

        SetTools.difference(badTableFoodGroupNames, descFoodGroupNames);
        SetTools.difference(badTableFoodGroupNames, exceptionFoodGroupNames);

        SetTools.difference(badGraphFoodGroupNames, descFoodGroupNames);
        SetTools.difference(badGraphFoodGroupNames, exceptionFoodGroupNames);

        if (badTableFoodGroupNames.size > 0) {
            console.log("The following Food Groups in the TABLE Food Ingredients CSV do not match the food groups in Food Group Descriptions CSV: ", badTableFoodGroupNames);
        }

        if (badGraphFoodGroupNames.size > 0) {
            console.log("The following Food Groups in the GRAPH Food Ingredients CSV do not match the food groups in Food Group Descriptions CSV: ", badGraphFoodGroupNames);
        }
    }

    // getInterpretationValue(interpretationValue): Retrieves the interpretation value to be displayed
    //  in the table of the visual's
    static getInterpretationValue(interpretationValue) {
        return interpretationValue == "<10" ? "X" : interpretationValue;
    }

    // cleanFoodGroupName(foodGroupName): Normalizes the food group name when joining data between the Food Group Descriptions CSV and
    //  the TABLE/GRAPH Food Ingredients CSVs
    static cleanFoodGroupName(foodGroupName) {
        return foodGroupName.trim().toLowerCase();
    }

    // getNutrientUnit(nutrient): Retrieves the unit for the nutrient
    getNutrientUnit(){
        const nutrientData = this.graphNutrientTablesByDemoGroupLv1[this.nutrient];
        return Object.values(Object.values(nutrientData)[0])[0][0]["Unit"];
    }

    // findNutrientTotalAmtPerAgeSexGroup(graphType) calculate the total amount by nutrient per age-sex group
    // Note:
    //  This function creates the [food group, {graphType: intake, interpretationNotes: interpretationValue}] pairs needed for the bar graph
    findNutrientTotalAmtPerAgeSexGroup(graphType) {
        let maxAccumulatedAmount = 0;
        const nutrientData = this.graphNutrientTablesByDemoGroupLv1[this.nutrient];

        /* If graph type is number, get data from "Amount" col, otherwise use "Percentage" */
        const keyName = graphType === "number" ? "Amount" : "Percentage"

        const groupedAmount = this.ageSexGroupHeadings.reduce((obj, ageSexGroup) => {
            obj[ageSexGroup] = Object.keys(nutrientData[ageSexGroup]).reduce((innerObj, foodLevelGroup) => {
                let amountObj = {};
                amountObj[graphType] = 0;
                amountObj[FoodIngredientDataColNames.interpretationNotes] = undefined;

                for (let dataRow of nutrientData[ageSexGroup][foodLevelGroup]) {
                    // we want only the overall amounts for each food group, so ignore the rows representing subgroups
                    const notValidFoodGroupLv1Amount = isNaN(dataRow[keyName]) || dataRow["Food group_level2"] || dataRow["Food group_level3"];
                    if (notValidFoodGroupLv1Amount) {
                        continue;
                    }

                    amountObj[graphType] += dataRow[keyName];

                    let intepretationValue = dataRow[FoodIngredientDataColNames.interpretationNotes];
                    if (typeof intepretationValue === 'string' && !amountObj[FoodIngredientDataColNames.interpretationNotes]) {
                        amountObj[FoodIngredientDataColNames.interpretationNotes] = Model.getInterpretationValue(intepretationValue);
                    }
                }

                innerObj[foodLevelGroup] = amountObj;
                return innerObj;
            }, {})

            maxAccumulatedAmount = Math.max(maxAccumulatedAmount, Object.values(obj[ageSexGroup]).reduce((sum, cur) => sum + cur[graphType], 0))
            return obj;
        }, {})

        return {"groupedAmount": groupedAmount, "maxAccumulatedAmount": maxAccumulatedAmount};
    }

    // getFoodDescription(nutrient, foodGroup): Retrieves the corresponding food description for 'foodGroup' and 'nutrient'
    getFoodDescription(nutrient, foodGroup) {
        foodGroup = Model.cleanFoodGroupName(foodGroup);
        if (this.foodDescExeceptions[foodGroup] === undefined) {
            return this.foodGroupDescriptionData[foodGroup][FoodGroupDescDataColNames.description];
        }

        // descriptions that depend whether the nutrient is sodium or not
        if (nutrient != "Sodium") {
            nutrient = "OtherNutrients";
        }

        const foodDescriptionKey = Model.cleanFoodGroupName(this.foodDescExeceptions[foodGroup][nutrient]);
        return this.foodGroupDescriptionData[foodDescriptionKey][FoodGroupDescDataColNames.description];
    }

    // getFoodGroupArticle(foodGroup): Retrieves the article that prefixes a food group
    // Note:
    //  Used for French translations
    getFoodGroupArticle(foodGroup) {
        foodGroup = Model.cleanFoodGroupName(foodGroup);
        const foodGroupData = this.tableNutrientTablesByFoodGroups[foodGroup];

        if (foodGroupData === undefined) {
            return "";
        }

        const foodGroupDepth = parseInt(foodGroupData[FoodIngredientDataColNames.foodGroupDepth]);
        let articleColName = FoodIngredientDataColNames[`articleGroupLv${foodGroupDepth}`];

        const result = foodGroupData[articleColName];
        return result ?? "";
    }

    // buildSunBurstTree(nutrient, ageSexGroup): Build the tree needed for the data of the sun burst graph
    buildSunBurstTree(nutrient, ageSexGroup) {
        const nutrientData = this.graphNutrientTablesFullyNestedDataByFoodGroup[nutrient];

        /* Group data into a tree where each node has the form of { name, value, row, children } for d3.hierarchy() */
        let groupedPercentages = Object.keys(nutrientData[ageSexGroup]).reduce((objLevel1, foodLevel1) => {
            const foodLevel1Group = nutrientData[ageSexGroup][foodLevel1];

            objLevel1.children.push(Object.keys(nutrientData[ageSexGroup][foodLevel1]).filter(d => d).reduce((objLevel2, foodLevel2) => {
                const foodLevel2Group = foodLevel1Group[foodLevel2];
                objLevel2.value -= foodLevel2Group[""][FoodIngredientDataColNames.amount];
                const newChild = {
                    name: foodLevel2Group[""][FoodIngredientDataColNames.foodGroupLv2],
                    value: foodLevel2Group[""][FoodIngredientDataColNames.amount],
                    interpretationValue: Model.getInterpretationValue(foodLevel2Group[""][FoodIngredientDataColNames.interpretationNotes]),
                    row: foodLevel2Group[""]
                };
                newChild.children = Object.keys(foodLevel2Group).filter(d => d).map((foodLevel3) => {
                    const foodLevel3Group = foodLevel2Group[foodLevel3];
                    newChild.value -= foodLevel3Group[FoodIngredientDataColNames.amount];
                    return {
                        name: foodLevel3Group[FoodIngredientDataColNames.foodGroupLv3],
                        value: foodLevel3Group[FoodIngredientDataColNames.amount],
                        interpretationValue: Model.getInterpretationValue(foodLevel3Group[FoodIngredientDataColNames.interpretationNotes]),
                        row: foodLevel3Group
                    }
                })
                objLevel2.children.push(newChild);
                return objLevel2;
            }, { 
                name: foodLevel1Group[""][""][FoodIngredientDataColNames.foodGroupLv1],
                value: foodLevel1Group[""][""][FoodIngredientDataColNames.amount], // key "" represents the overall group including all subgroups
                interpretationValue: Model.getInterpretationValue(foodLevel1Group[""][""][FoodIngredientDataColNames.interpretationNotes]),
                row: foodLevel1Group[""][""], 
                children: []
            }));
            return objLevel1;
        }, { name: Translation.translate("lowerGraph.allItems"), row: {Percentage: 100}, children: [] });

        groupedPercentages = {name: "data", children: [groupedPercentages]}
        return groupedPercentages;
    }

    // defaultCompare(value1, value2): Default compare functions for sorting
    static defaultCompare(value1, value2) { 
        if (value1 == value2) return 0
        else if (value1 > value2) return 1
        else return -1;
    }

    // strNumCompare(value1, value): Compare function that gives numbers precedence over strings
    static strNumCompare(value1, value2) {
        const num1 = parseFloat(value1);
        const num2 = parseFloat(value2);
        const num1IsNAN = Number.isNaN(num1);
        const num2IsNAN = Number.isNaN(num2);

        if (num1IsNAN && !num2IsNAN) return -1
        else if (!num1IsNAN && num2IsNAN) return 1
        else return Model.defaultCompare(value1, value2);
    }

    // getFoodIngredientNumberedCell(foodIngredientRow, column): Retrieves the value for a cell that corresponds to a 
    //  numbered column (eg. Amount_SE or Percentage_SE) for the tables in the bargraph and the sunburst graph
    static getFoodIngredientNumberedCell(foodIngredientRow, column) {

        // get the interpretation notes for values that are not numbers
        if (Number.isNaN(foodIngredientRow[column])) {
            return Model.getInterpretationValue(foodIngredientRow[FoodIngredientDataColNames.interpretationNotes]);
        
        // adds the 'E' to SE amounts or SE percentages
        } else if (foodIngredientRow[FoodIngredientDataColNames.interpretationNotes] == "E" && 
                    (column == FoodIngredientDataColNames.amountSE || column == FoodIngredientDataColNames.percentageSE)) {

            // we translate the number here since the result will still be a string with the added "E" interpretation note
            const numPart = Translation.translateNum(foodIngredientRow[column]);
            return `${numPart} ${foodIngredientRow[FoodIngredientDataColNames.interpretationNotes]}`;
        }

        return foodIngredientRow[column];
    }

    // createBarGraphTable(title): Creates the data for the table of the bar graph
    createBarGraphTable(title) {
        const nutrientData = this.tableNutrientTablesByDemoGroupLv1[this.nutrient];
        const headingsPerSexAgeGroup = Translation.translate("upperGraph.tableSubHeadings", { returnObjects: true, unit: this.getNutrientUnit() });
        const headingsPerSexAgeGroupKeys = [FoodIngredientDataColNames.amount, FoodIngredientDataColNames.amountSE, FoodIngredientDataColNames.percentage, FoodIngredientDataColNames.percentageSE];
        const ageSexGroupHeadingsLen = this.ageSexGroupHeadings.length;
        const headingPerSexAgeGroupKeysLen = headingsPerSexAgeGroupKeys.length;

        const nutrientAgeGroups = Object.keys(nutrientData);

        // headings for the top most level of the table
        const tableHeadings = ["", ...this.ageSexGroupHeadings.filter(g => nutrientAgeGroups.includes(g))];

        // sub-headings of the table
        const subHeadings = [Translation.translate("upperGraph.tableSubHeadingFirstCol")].concat(Object.keys(nutrientData).map(() => headingsPerSexAgeGroup).flat());

        // Get the rows needed for the table
        const tableRows = {};
        Object.entries(nutrientData).map((entry) => {
            const [ageSexGroup, foodLevelGroup] = entry;            
            Object.entries(foodLevelGroup).map(foodLevelGroupEntry => {
                const [foodLevelName, foodLevelGroupData] = foodLevelGroupEntry;
                const foodLevelRowData = (tableRows[foodLevelName] ?? []);
                foodLevelRowData.splice(
                    this.ageSexGroupHeadings.indexOf(ageSexGroup), 
                    0, 
                    foodLevelGroupData.find(d => !d["Food group_level2"] && !d["Food group_level3"])
                )
                tableRows[foodLevelName] = foodLevelRowData;
            })
        })

        // retrieve whether the column is a column that refers to numbers
        const colIsNumbered = [false];
        for (let i = 0; i < ageSexGroupHeadingsLen; ++i) {
            for (let j = 0; j < headingPerSexAgeGroupKeysLen; ++j) {
                colIsNumbered.push(true);
            }
        } 

        // Retrieve the specific value for each row
        const result = [];
        Object.entries(tableRows).forEach(([foodLevelGroup, d]) => {
            const foodLevelGroupName = d[0][FoodIngredientDataColNames.foodGroupLv1];
            result.push([foodLevelGroupName].concat(d.map(g => headingsPerSexAgeGroupKeys.map(key => Model.getFoodIngredientNumberedCell(g, key))).flat()));
        });

        // create the title for the CSV
        const csvTitle = [];
        for (let i = 0; i < 2; ++i) {
            csvTitle.push(subHeadings.map(() => { return ""}));
        }

        csvTitle[0][0] = title;

        // create the table content for the CSV
        const csvTable = [];
        for (const row of result) {
            const colLen = row.length;
            const newRow = [];
            for (let i = 0; i < colLen; ++i) {
                newRow.push(colIsNumbered[i] ? Translation.translateNum(row[i]) : row[i]);
            }

            csvTable.push(newRow);
        }

        // get the footnotes to the CSV
        const csvFootNotes = [];
        for (let i = 0; i < 6; ++i) {
            csvFootNotes.push(subHeadings.map(() => { return ""}));
        }

        csvFootNotes[1][0] = Translation.translate("FootNotes.EInterpretationNote");
        csvFootNotes[2][0] = Translation.translate("FootNotes.FInterpretationNote");
        csvFootNotes[3][0] = Translation.translate("FootNotes.XInterpretationNote");
        csvFootNotes[4][0] = Translation.translate("FootNotes.excludePregnantAndLactating");
        csvFootNotes[5][0] = Translation.translate("FootNotes.sourceText");

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

        const csvContent = TableTools.createCSVContent(csvTitle.concat([csvHeadings, subHeadings]).concat(csvTable).concat(csvFootNotes));

        // -----------------------------------------------------------------------------------------

        // get the compare functions of each heading for sorting
        const compareFuncs = subHeadings.map((heading, ind) => {
            if (ind == 0) return Model.defaultCompare
            else if (ind % 2 == 1) return Model.strNumCompare
            else return null;
        });    

        this.barGraphTable = { headings: tableHeadings, subHeadings: subHeadings.map((heading, ind) => { return {heading, ind} }), table: result, headingsPerSexAgeGroup, csvContent, compareFuncs, colIsNumbered};
        return this.barGraphTable;
    }

    // createSunburstAllTable(): Creates the data for the table of the sunburst graph to display all the age-sex groups
    createSunburstAllTable() {
        let nutrientData = this.tableNutrientTables[this.nutrient];
        const headingsPerSexAgeGroupKeys = [FoodIngredientDataColNames.amount, FoodIngredientDataColNames.amountSE, FoodIngredientDataColNames.percentage, FoodIngredientDataColNames.percentageSE];

        let sunBurstTableHeadings = Translation.translate("lowerGraph.tableAllDataHeadings", { returnObjects: true, unit: this.getNutrientUnit() });
        let donutTableHeadings = sunBurstTableHeadings.toSpliced(LowerGraphAllDataColInd.FoodGroupLv3, 1);

        // create the data rows for the table
        let sunBurstData = [];
        for (const row of nutrientData) {
            let newRow = [row[FoodIngredientDataColNames.ageSexGroup], row[FoodIngredientDataColNames.foodGroupLv1], row[FoodIngredientDataColNames.foodGroupLv2], row[FoodIngredientDataColNames.foodGroupLv3]];
            newRow = newRow.map((cellValue) => { return Number.isNaN(cellValue) ? "" : cellValue});

            const amountData = headingsPerSexAgeGroupKeys.map(key => Translation.translateNum(Model.getFoodIngredientNumberedCell(row, key)));
            sunBurstData.push(newRow.concat(amountData));
        }

        // filter the data for the donut
        let donutData = sunBurstData.filter((row) => { return (row[LowerGraphAllDataColInd.FoodGroupLv2] != "" &&  row[LowerGraphAllDataColInd.FoodGroupLv3] == "") });
        donutData = donutData.map((row) => {  return row.toSpliced(LowerGraphAllDataColInd.FoodGroupLv3, 1); });

        // create the title for the CSV
        const sunBurstCsvTitle = [];
        const donutCsvTitle = [];
        for (let i = 0; i < 2; ++i) {
            sunBurstCsvTitle.push(sunBurstTableHeadings.map(() => { return ""}));
            donutCsvTitle.push(sunBurstTableHeadings.map(() => { return ""}));
        }

        sunBurstCsvTitle[0][0] = Translation.translate("lowerGraph.allDataCSVFileName.All Displayed", {nutrient: this.nutrient});
        donutCsvTitle[0][0] = Translation.translate("lowerGraph.allDataCSVFileName.Filter Only Level 2", {nutrient: this.nutrient});

        // get the footnotes to the CSV
        const sunBurstCsvFootNotes = [];
        for (let i = 0; i < 6; ++i) {
            sunBurstCsvFootNotes.push(sunBurstTableHeadings.map(() => { return ""}));
        }

        sunBurstCsvFootNotes[1][0] = Translation.translate("FootNotes.EInterpretationNote");
        sunBurstCsvFootNotes[2][0] = Translation.translate("FootNotes.FInterpretationNote");
        sunBurstCsvFootNotes[3][0] = Translation.translate("FootNotes.XInterpretationNote");
        sunBurstCsvFootNotes[4][0] = Translation.translate("FootNotes.excludePregnantAndLactating");
        sunBurstCsvFootNotes[5][0] = Translation.translate("FootNotes.sourceText");

        const donutCsvFootNotes = sunBurstCsvFootNotes.map((row) => { return row.toSpliced(LowerGraphAllDataColInd.FoodGroupLv3, 1); });

        // get the text needed for the CSV export
        const sunBurstCsvContent = TableTools.createCSVContent(sunBurstCsvTitle.concat([sunBurstTableHeadings]).concat(sunBurstData).concat(sunBurstCsvFootNotes));
        const donutCsvContent = TableTools.createCSVContent(donutCsvTitle.concat([donutTableHeadings]).concat(donutData).concat(donutCsvFootNotes));

        this.sunBurstTableAllData = {};
        this.sunBurstTableAllData[SunBurstStates.AllDisplayed] = sunBurstCsvContent;
        this.sunBurstTableAllData[SunBurstStates.FilterOnlyLevel2] = donutCsvContent;

        return this.sunBurstTableAllData;
    }

    // createSunburstDisplayedTable(ageSexGroup, sunBurstState, foodGroupDepth, foodGroupName, title): Creates the data for the table of the sunburst graph
    createSunburstDisplayedTable(ageSexGroup, sunBurstState, foodGroupDepth, foodGroupName, title) {
        const graphIsAllDisplayed = sunBurstState == SunBurstStates.AllDisplayed;
        const nutrientData = this.tableNutrientTablesByDemoGroupLv1[this.nutrient][ageSexGroup];
        foodGroupName = foodGroupName.trim().toLowerCase();

        let foodGroupColumn = null;
        if (graphIsAllDisplayed && foodGroupDepth >= 2) {
            foodGroupColumn = FoodGroupDepthToCol[foodGroupDepth];

        } else if (sunBurstState == SunBurstStates.FilterOnlyLevel2) {
            foodGroupColumn = FoodIngredientDataColNames.foodGroupLv2;
            foodGroupName = null;
        }

        let result = [];

        // filter the data based off the selected food group
        if (foodGroupColumn !== null) {
            for (const foodGroupLv1Name in nutrientData) {
                const filteredFoodGroupRows = nutrientData[foodGroupLv1Name].filter((row) => {
                    const rowFoodGroupName = row[foodGroupColumn];
                    return (!Number.isNaN(rowFoodGroupName) && 
                            ((foodGroupName !== null && rowFoodGroupName.trim().toLowerCase() == foodGroupName) || 
                             (foodGroupName === null && Number.isNaN(row[FoodIngredientDataColNames.foodGroupLv3]))));
                });

                result = result.concat(filteredFoodGroupRows);
            }

        // include all rows to the table
        } else{
            for (const foodGroup in nutrientData) {
                result = result.concat(nutrientData[foodGroup]);
            }
        }

        let tableHeadings = Translation.translate("lowerGraph.tableHeadings", { returnObjects: true, unit: this.getNutrientUnit() });
        if (!graphIsAllDisplayed) {
            tableHeadings.splice(LowerGraphFoodGroupLv3ColInd, 1);
        }

        const headingsPerSexAgeGroupKeys = [FoodIngredientDataColNames.amount, FoodIngredientDataColNames.amountSE, FoodIngredientDataColNames.percentage, FoodIngredientDataColNames.percentageSE];
        const headingPerSexAgeGroupKeysLen = headingsPerSexAgeGroupKeys.length;

        // get the specific values for each row
        result = result.map((row) => {
            let foodGroupData = [row["Food group_level1"], row["Food group_level2"]];
            if (graphIsAllDisplayed) {
                foodGroupData.push(row["Food group_level3"]);
            }

            foodGroupData = foodGroupData.map(foodGroupLv => Number.isNaN(foodGroupLv) ? "" : foodGroupLv);

            const amountData = headingsPerSexAgeGroupKeys.map(key => Model.getFoodIngredientNumberedCell(row, key));
            return foodGroupData.concat(amountData);
        });

        // retrieve whether the column is a column that refers to numbers
        const colIsNumbered = [false, false];
        if (graphIsAllDisplayed) {
            colIsNumbered.push(false);
        }

        for (let j = 0; j < headingPerSexAgeGroupKeysLen; ++j) {
            colIsNumbered.push(true);
        }

        // create the title for the CSV
        const csvTitle = [];
        for (let i = 0; i < 2; ++i) {
            csvTitle.push(tableHeadings.map(() => { return ""}));
        }

        csvTitle[0][0] = title;

        // create the table content for the CSV
        const csvTable = [];
        for (const row of result) {
            const colLen = row.length;
            const newRow = [];
            for (let i = 0; i < colLen; ++i) {
                newRow.push(colIsNumbered[i] ? Translation.translateNum(row[i]) : row[i]);
            }

            csvTable.push(newRow);
        }

        // get the footnotes to the CSV
        const csvFootNotes = [];
        for (let i = 0; i < 6; ++i) {
            csvFootNotes.push(tableHeadings.map(() => { return ""}));
        }

        csvFootNotes[1][0] = Translation.translate("FootNotes.EInterpretationNote");
        csvFootNotes[2][0] = Translation.translate("FootNotes.FInterpretationNote");
        csvFootNotes[3][0] = Translation.translate("FootNotes.XInterpretationNote");
        csvFootNotes[4][0] = Translation.translate("FootNotes.excludePregnantAndLactating");
        csvFootNotes[5][0] = Translation.translate("FootNotes.sourceText");

        // get the text needed for the CSV export
        const csvContent = TableTools.createCSVContent(csvTitle.concat([tableHeadings]).concat(csvTable).concat(csvFootNotes));

        // get the compare functions of each heading for sorting
        let compareFuncs = [Model.defaultCompare, Model.defaultCompare];
        if (graphIsAllDisplayed) {
            compareFuncs.push(Model.defaultCompare);
        }

        compareFuncs = compareFuncs.concat([Model.strNumCompare, null, Model.strNumCompare, null]);

        this.sunburstTable = { headings: tableHeadings.map((heading, ind) => { return {heading, ind} }), table: result, csvContent, compareFuncs, colIsNumbered };
        return this.sunburstTable;
    }
}