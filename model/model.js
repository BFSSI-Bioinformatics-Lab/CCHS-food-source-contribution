////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// Purpose: Handles the overall backend of the website                                //
//                                                                                    //
// What it contains:                                                                  //
//      - which nutrient is being selected in the nutrient dropdown                   //
//      - any backend data related to 'Food Group descriptions.csv' or                //
//          'FSCT data_Food_ingredients CCHS 2015 all nutrients_Infobase.csv'         //
//      - wrapper functions for loading the data related to the CSV files, most of    //
//          the data manipulation is handled by their respective data models in       //
//          './dataModels.js'                                                         //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////


import { FoodIngredientDataModel, FoodDescriptionDataModel } from "./dataModels.js";


// Model: The overall model for the user interface
export class Model {
    constructor(foodGroupDescriptionFileSrc, nutrientFileSrc) {
        this.nutrient = "";
        this.foodGroupDescriptionData = new FoodDescriptionDataModel(foodGroupDescriptionFileSrc);
        this.foodIngredientData = new FoodIngredientDataModel(nutrientFileSrc);
    }

    // load(): Setup all the needed data for the user interface
    async load() {
        await Promise.all([this.loadFoodGroupDescriptionData(), this.loadFoodIngredientsData()]);
    }

    // loadFoodGroupDescriptionData(): Load the data for all the food group descriptions
    async loadFoodGroupDescriptionData() {
        await this.foodGroupDescriptionData.load();
    }

    // loadFoodIngredientsData(): Load the data for all the food ingredients
    async loadFoodIngredientsData(){
        await this.foodIngredientData.load();
    }
}