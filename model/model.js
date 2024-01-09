import { CSVDataModel } from "./dataModels/csvDataModel.js";
import { NutrientDataModel } from "./dataModels/nutrientDataModel.js";

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
                                                Number.isNaN(d["Food Group Name_Level 3"]) ? 
                                                    Number.isNaN(d["Food Group Name_Level 2"]) ? 
                                                        d["Food Group Name_Level 1"]
                                                        : d["Food Group Name_Level 2"]
                                                    : d["Food Group Name_Level 3"]
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

        console.log("D1: ", dataGroupedByNutrientAndDemoList);
        console.log("D2: ", dataGroupedByNutrientAndDemo);
        console.log("D3: ", fullyNestedDataByFoodGroup);

        return new NutrientDataModel(data, dataGroupedByNutrientAndDemoList, dataGroupedByNutrientAndDemo, fullyNestedDataByFoodGroup);
    }
}