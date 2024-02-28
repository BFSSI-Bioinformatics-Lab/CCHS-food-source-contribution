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


import { Model } from './backend.js'
import { upperGraph } from './barGraph.js';
import { lowerGraph } from './sunBurstGraph.js';
import { Visuals } from './visuals.js';
import { TranslationTools, TranslationObj } from './assets.js';


function setup(model) {
    const nutrientSelectorId = "#upperGraphNutrientSelect";
    const updateBarGraph = upperGraph(model);
    const updateSunburst = lowerGraph(model);

    const nutrientOptions = Object.keys(model.graphNutrientTablesByDemoGroupLv1);
    d3.select(nutrientSelectorId)
        .on("change", () => { update() })
        .selectAll("option")
        .data(nutrientOptions)
        .enter()
        .append("option")
            .attr("title", d => d)
            .property("value", d => d)
            .text(d => d);

    update();

    // update(): Updates how the bar graph and sunburst graph looks
    function update() {
        model.nutrient = Visuals.getSelector(nutrientSelectorId);
        updateBarGraph();
        updateSunburst();

        // only make the graphs visible once everything is set up 
        d3.select("#foodSourceContributionTool").style("visibility", "visible");
    }
}


//////////
// MAIN //
//////////
// load in the view for the application
window.addEventListener("load", () => {
    const model = new Model();
    TranslationTools.registerTranslation(TranslationObj);

    Promise.all([model.load()]).then(() => {
        setup(model);
    });
});