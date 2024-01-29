import { CSVDataModel } from "./dataModels/dataModels.js";
import { FoodIngredientDataModel } from "./dataModels/dataModels.js";
import { FoodGroupDescDataColNames, NutrientDataColNames } from "../assets/assets.js";


// Model: The overall model for the user interface
export class Model {
    #foodGroupDescriptionFileSrc;
    #nutrientFileSrc;

    constructor(foodGroupDescriptionFileSrc, nutrientFileSrc) {
        this.#foodGroupDescriptionFileSrc = foodGroupDescriptionFileSrc;
        this.#nutrientFileSrc = nutrientFileSrc;

        this.foodGroupDescriptionData = null;
    }
    
    // convert all numeric fields into floats:
    numToFloat(data) {
        data.forEach(d => {
            Object.keys(d).forEach(key => d[key] = isNaN(d[key]) ? d[key] : parseFloat(d[key]))
        });

        return data;
    }

    async loadFoodGroupDescriptionData() {
        let data = await d3.csv(this.#foodGroupDescriptionFileSrc);
        data = this.numToFloat(data);
    
        const fullyNestedDataByFoodLevel = Object.freeze(d3.nest()
                                            .key(d => 
                                                Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv3]) ? 
                                                    Number.isNaN(d[FoodGroupDescDataColNames.foodGroupLv2]) ? 
                                                        d[FoodGroupDescDataColNames.foodGroupLv1]
                                                        : d[FoodGroupDescDataColNames.foodGroupLv2]
                                                    : d[FoodGroupDescDataColNames.foodGroupLv3]
                                            )
                                            .rollup(d => d[0])
                                            .object(data));
        return new CSVDataModel(fullyNestedDataByFoodLevel);  
    }

    async loadNutrientsData(){
        let data = await d3.csv(this.#nutrientFileSrc);
        data = this.numToFloat(data);

        const dataGroupedByNutrientAndDemoList = Object.freeze(d3.nest()
                                        .key(d => d.Nutrient)
                                        .key(d => d[NutrientDataColNames.ageSexGroup])
                                        .object(data));

        const dataGroupedByNutrientAndDemo = Object.freeze(d3.nest()
                                        .key(d => d.Nutrient)
                                        .key(d => d[NutrientDataColNames.ageSexGroup])
                                        .key(d => d[NutrientDataColNames.foodGroupLv1])
                                        .object(data));

        const fullyNestedDataByFoodGroup = Object.freeze(d3.nest()
                                            .key(d => d.Nutrient)
                                            .key(d => d[NutrientDataColNames.ageSexGroup])
                                            .key(d => d[NutrientDataColNames.foodGroupLv1])
                                            .key(d => Number.isNaN(d[NutrientDataColNames.foodGroupLv2]) ? "" : d[NutrientDataColNames.foodGroupLv2] )
                                            .key(d => Number.isNaN(d[NutrientDataColNames.foodGroupLv3]) ? "" : d[NutrientDataColNames.foodGroupLv3] )
                                            .rollup(d => d[0])
                                            .object(data));

        return new FoodIngredientDataModel(data, dataGroupedByNutrientAndDemoList, dataGroupedByNutrientAndDemo, fullyNestedDataByFoodGroup);
    }
}