import { Model } from '../model/model.js'
import { BarGraph } from './components/barGraph.js';
import { SunBurst } from './components/sunBurstGraph.js';
import { ViewTools } from './tools/viewTools.js';
import { TranslationTools, TranslationObj } from '../tools/translationTools.js';
import { Component } from './components/component.js';


// ViewController: Overall class for the view and controller
class ViewController extends Component{
    constructor({model = null} = {}) {
        super();
        this.model = model;

        this.updateSunburst = null;
        this.updateBarGraph = null;

        // === individual elements for the component ===
        this.nutrientSelector = null;
        this.sunBurst = null;
        this.barGraph = null;

        // =============================================
    }

    setup(opts = {}) {
        const nutrientOptions = Object.keys(this.model.foodIngredientData.dataGroupedByNutrientAndDemo);
        this.nutrientSelector = d3.select("#upperGraphNutrientSelect")
            .on("change", () => { this.redraw(); })
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

    redraw(opts = {}) {
        this.model.nutrient = ViewTools.getSelector(this.nutrientSelector);
        this.updateBarGraph();
        this.updateSunburst();

        // only make the graphs visible once everything is set up 
        d3.select("#foodSourceContributionTool").style("visibility", "visible");
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