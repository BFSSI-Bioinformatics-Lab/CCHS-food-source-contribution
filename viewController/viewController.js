import { TranslationObj } from '../assets/strings/strings.js';
import { Model } from '../model/model.js'
import { BarGraph } from './components/barGraph/barGraph.js';
import { sunBurst } from './components/sunBurstGraph/sunBurstGraph.js';
import { viewTools } from './tools/viewTools.js';
import { TranslationTools } from '../tools/translationTools.js';


// ViewController: Overall class for the view and controller
class ViewController {
    /* Calls loading of data and sets up the selector to call the chart update functions on change */
    async setupTool(){
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

                const upperGraph = new BarGraph(nutrientsData, foodGroupDescriptionsData.data);
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
};



const viewController = new ViewController();

// load in the view for the application
window.addEventListener("load", () => {
    TranslationTools.registerTranslation(TranslationObj);
    viewController.setupTool();
})