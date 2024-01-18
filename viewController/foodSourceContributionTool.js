import { TranslationObj } from '../assets/strings/translations.js'
import { Model } from '../model/model.js'
import { barGraph } from './components/barGraph/barGraph.js';
import { sunBurst } from './components/sunBurstGraph/sunBurstGraph.js';
import { viewTools } from './tools/viewTools.js';
import { TranslationTools } from '../tools/translationTools.js';


// register translations for text
window.addEventListener("load", () => {
    TranslationTools.registerTranslation(TranslationObj);
    setupTool();
})

/* Calls loading of data and sets up the selector to call the chart update functions on change */
async function setupTool(){
    const model = new Model("data/Food Group descriptions.csv", "data/FSCT data_Food_ingredients CCHS 2015 all nutrients_Infobase.csv");

    Promise.all([model.loadNutrientsData(), model.loadFoodGroupDescriptionData()])
        .then((files) => {
            const [nutrientsData, foodGroupDescriptionsData] = files;

            const nutrientOptions = Object.keys(nutrientsData.dataGroupedByNutrientAndDemo);
        
            const nutrientSelector = d3.select("#upperGraphNutrientSelect")
                .on("change", updateTool)
                .selectAll("option")
                .data(nutrientOptions)
                .enter()
                .append("option")
                    .attr("title", d => d)
                    .property("value", d => d)
                    .text(d => d);

            const upperGraph = new barGraph(nutrientsData, foodGroupDescriptionsData.data);
            const lowerGraph = new sunBurst(nutrientsData, foodGroupDescriptionsData.data);
                    
            const updateUpperGraph = upperGraph.draw();
            const updateLowerGraph = lowerGraph.draw();
        
            function updateTool(){
                const nutrient = viewTools.getSelector("#upperGraphNutrientSelect");
                updateUpperGraph(nutrient);
                updateLowerGraph(nutrient);
            }
        
            updateTool();
        
            // only make the graphs visible once everything is set up 
            d3.select("#foodSourceContributionTool").style("visibility", "visible");
        });
}