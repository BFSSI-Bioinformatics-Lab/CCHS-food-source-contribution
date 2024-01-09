import { CSVDataModel } from "./csvDataModel.js";

export class NutrientDataModel extends CSVDataModel {
    constructor(data, dataGroupedByNutrientAndDemoList, dataGroupedByNutrientAndDemo, fullyNestedDataByFoodGroup) {
        super(data);
        this.dataGroupedByNutrientAndDemoList = dataGroupedByNutrientAndDemoList;
        this.dataGroupedByNutrientAndDemo = dataGroupedByNutrientAndDemo;
        this.fullyNestedDataByFoodGroup = fullyNestedDataByFoodGroup;
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
}