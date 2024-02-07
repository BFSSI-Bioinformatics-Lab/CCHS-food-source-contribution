//////////////////////////////////////////////////////////////////////
//                                                                  //
// Purpose:                                                         //
//      - Defines functions that are commonly used throughout       //
//          the entire program                                      //
//                                                                  //
// What it contains:                                                //
//      - translations of text used in the program                  //
//                                                                  //
//      Func: A wrapper for calling anonymous functions             //
//              - used in the components inherited from             //
//                  '../viewController/components.js' that defined  //
//                  mouse events                                    //
//                                                                  //
//      TableTools: Class for handling any table manipulation       //
//              - used in loading the backend data for the program  //
//                                                                  //
//      ViewTools: Class for common functions used in the display   //
//          of the program                                          //
//              - measures the width of text displayed              //
//              - gets the value of certain HTML elements           //
//                                                                  //
//      TranslationTools: Class for handling text translations      //
//              - gets the corresponding translated text            //
//                  for the display of the program                  //
//                                                                  //
//////////////////////////////////////////////////////////////////////


// Func: Wrapper class for handling anonymous functions or
//  higher ordered functions
export class Func {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }

    // run(): Runs the function
    run() {
        if (Array.isArray(this.args)) {
            return this.func(...this.args);
        } else {
            return this.func(this.args);
        }
    }

    // setArg(name, value): Sets the arguments for the function
    setArg(name, value) {
        if (Array.isArray(this.args)) {
            this.args.push(value);
        } else {
            this.args[name] = value;
        }
    }
};


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
}


// ViewTools: Class of helper functions used only for the view
export class ViewTools {
    WidthCanvas = undefined;

    /* Returns selected option given a select html tag selector or element */
    static getSelector(element) {
        if (typeof element === 'string') {
            element = d3.select(element);
        }

        return element.property("value");
    }


    // getTextWidth(text, fontSize, fontFamily): Retrieves the width of 'text' that is more
    //      stable than D3's getComputedTextLength
    // Note: D3's getComputedTextLength requires the text element to be rendered to be
    //      able to get the text length. If the text element is hidden or not rendered yet, then
    //      getComputedTextLength will always return 0
    //
    // Reference: http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
    static getTextWidth(text, fontSize, fontFamily) {
        // if given, use cached canvas for better performance
        // else, create new canvas
        var canvas = this.WidthCanvas || (this.WidthCanvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = fontSize + 'px ' + fontFamily;
        return context.measureText(text).width;
    };
}


// TranslationTools: Helper class for doing translations
export class TranslationTools {
    static registerTranslation(resources){
        i18next.use(i18nextBrowserLanguageDetector).init({
            fallbackLng: "en",
            detection: {
                order: ['querystring', 'htmlTag', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'path', 'subdomain'],
            },
            resources: resources
        })
        i18next.changeLanguage();
    }
    
    static translateText(key, args){
        return i18next.t(key, args)
    }
}


// translations for certain text used in the project
export const TranslationObj = {
    en: {
        translation: {
            "upperGraph": {
                "number": {
                    "graphTitle": "Daily {{ nutrient }} intake per person ({{ amountUnit }}/d) provided by 12 food groups.",
                    "yAxisTitle": "{{nutrient}} Intake ({{ amountUnit }}/d)",
                    "switchTypeButton": "Switch to Percentage"
                },
                "percentage": {
                    "graphTitle": "Percentage of total {{ nutrient }} intake provided by 12 food groups.",
                    "yAxisTitle": "% of total {{nutrient}} intake",
                    "switchTypeButton": "Switch to Numbers"
                },
                "graphFootnote": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
                "tableTitle": "Absolute ({{ amountUnit }}/day) and relative (%) contribution of 12 food groups to daily {{nutrient}} intake",   
                "infoBox_number": [
                    "{{- name }}",
                    "Amount: {{amount}}"
                ],
                "infoBox_percentage": [
                    "{{- name }}",
                    "{{ percentage }}% of total {{- nutrient }} intake."
                ]
            },
            "lowerGraph": {
                "graphTitle": "Food groups and sub-groups contribution to {{ nutrient }} intake in Canadian {{ ageSexGroup }}",
                "graphFootnote": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
                "tableTitle": "Absolute ({{ amountUnit }}/day) and relative (%) contribution of food groups and sub-groups to daily {{nutrient}} intake in Canadian {{ ageSexGroup }}, 2015",
                "seeLevel2Groups": "Filter on level 2 groups",
                "seeAllGroups": "See all food groups",
                "infoBoxLevel_1": [
                    "{{- name }}",
                    "{{ percentage }}% of total {{ nutrient }} intake."
                ],
                "infoBoxLevel_2": [
                    "{{- name }}",
                    "Contribution to:",
                    "Total {{ nutrient }} intake: {{ percentage }}%",
                    "{{- parentGroup }} group: {{ parentPercentage }}%"
                ],
                "infoBoxLevel_3": [
                    "{{- name }}",
                    "Contribution to:",
                    "Total {{ nutrient }} intake: {{ percentage }}%",
                    "{{- parentGroup }}: {{ parentPercentage }}%"
                ],
                "infoBoxLevel_4": [
                    "{{- name }}",
                    "Contribution to:",
                    "Total {{ nutrient }} intake: {{ percentage }}%",
                    "{{- parentGroup }}: {{ parentPercentage }}%"
                ],
                /* If the context number is not between 1-4 */
                "hoverBoxLevel_other": [ 
                    "{{- name }}",
                    "{{ percentage }}% of total {{ nutrient }} intake."
                ],
            }
        }
    },
    fr: { 
        translation: {} 
    }
}