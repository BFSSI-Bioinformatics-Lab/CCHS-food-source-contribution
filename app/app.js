////////////////////////////////////////////////////////////////////
//                                                                //
// Purpose: Handles the overall display of the program            //
//                                                                //
// What it Contains:                                              //
//      - wrappers to draw and update the sun burst graph and     //
//          the bar graph                                         //
//      - the main function to run the overall program            //
//      - initiliazes the backend of the program                  //
//                                                                //
////////////////////////////////////////////////////////////////////      



import { Model } from '../backend/backend.js'
import { BarGraph } from './barGraph.js';
import { SunBurst } from './sunBurstGraph.js';
import { Visuals } from './visuals.js';
import { TranslationTools, TranslationObj } from '../assets/assets.js';


// ViewController: Overall class for the view and controller
class ViewController {
    constructor({model = null} = {}) {
        this.model = model;

        this.updateSunburst = null;
        this.updateBarGraph = null;

        this.nutrientSelectorId = "#upperGraphNutrientSelect";

        // === individual elements for the component ===
        this.nutrientSelector = null;
        this.sunBurst = null;
        this.barGraph = null;

        // =============================================
    }

    setup() {
        const nutrientOptions = Object.keys(this.model.nutrientTablesByDemoGroupLv1);
        this.nutrientSelector = d3.select(this.nutrientSelectorId)
            .on("change", () => { this.update(); })
            .selectAll("option")
            .data(nutrientOptions)
            .enter()
            .append("option")
                .attr("title", d => d)
                .property("value", d => d)
                .text(d => d);

        this.barGraph = new BarGraph({model: this.model});
        this.sunBurst = new SunBurst({model: this.model});

        this.updateBarGraph = this.barGraph.draw();
        this.updateSunburst = this.sunBurst.draw();
    }

    // updateGraphs(): Updates the bar graph and the sunburst graph
    updateGraphs() {
        this.updateBarGraph();
        this.updateSunburst();
    }

    // update(): Updates the entire UI
    update() {
        this.model.nutrient = Visuals.getSelector(this.nutrientSelectorId);
        this.updateGraphs();

        // only make the graphs visible once everything is set up 
        d3.select("#foodSourceContributionTool").style("visibility", "visible");
    }

    // render(): Draws the entire UI onto the website
    render() {
        this.setup();
        this.update();
    }
};



//////////
// MAIN //
//////////
// load in the view for the application
window.addEventListener("load", () => {
    const model = new Model("data/Food Group descriptions.csv", "data/FSCT data_Food_ingredients CCHS 2015 all nutrients_Infobase.csv");
    const viewController = new ViewController({model: model});
    TranslationTools.registerTranslation(TranslationObj);

    Promise.all([model.load()]).then(() => {
        viewController.render();
    });
});