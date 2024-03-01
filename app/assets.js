/////////////////////////////////////////////////////////
//                                                     //
// Purpose: Defines constants within the app           //
//                                                     //
// What it contains:                                   //
//      - Colours                                      //
//      - Strings                                      //
//      - Enumerations                                 //
//                                                     //
/////////////////////////////////////////////////////////




// =================================================
// == Colours                                     ==
// =================================================

// Colours: Some commonly used colours
export const Colours = {
    None: "none",
    White: "white"
}


// GraphColours: Colours specific to the graph
export const GraphColours = {
    "Baby Foods": "#BAABDA",
    "Beverages (Excluding Milks)": "#F8CB2E",
    "Dairy & Plant-Based Beverages": "#39B7E3",
    "Fats & Oils": "#D8B384",
    "Fish & Seafood": "#FF6969",
    "Fruits & Vegetables": "#3CCF4E",
    "Grain Products": "#EF5B0C",
    "Meat & Poultry": "#BB2525",
    "Meat Alternatives": "#482121",
    "Nutritional Beverages & Bars": "#84F1CD",
    "Soups - Sauces - Spices & Other Ingredients": "#005DD0",
    "Sweets - Sugars & Savoury Snacks": "#824BD0",
    "All Items": "#808080"
}


// =================================================
// == Dimensions                                  ==
// =================================================


// DefaultDims: Default dimensions used for certain dimension attributes
export const DefaultDims = {
    fontSize: 12,
    paddingSize: 5,
    pos: 0,
    length: 0,
    borderWidth: 3,
    lineSpacing: 1
};


// GraphDims: Dimensions used for the graphs
export const GraphDims = Object.freeze({
    upperGraphWidth: 800,
    upperGraphHeight: 600,
    upperGraphLeft: 80,
    upperGraphRight: 400,
    upperGraphTop: 60,
    upperGraphBottom: 60,
    upperGraphTooltipMinWidth: 140,
    upperGraphAxesFontSize: 20,
    upperGraphXAxisTickFontSize: 13,
    upperGraphYAxisTickFontSize: 14,
    upperGraphTooltipFontSize: 12,
    upperGraphTooltipTopPadding: 8,
    upperGraphTooltipLeftPadding: 10,
    upperGraphTooltipLineSpacing: 3,
    upperGraphTooltipTextPaddingHor: 5,
    upperGraphTooltipTextPaddingVert: 3,
    upperGraphTooltipHighlightWidth: 1,
    upperGraphInfoBoxWidth: 240,
    upperGraphInfoBoxHeight: 200,
    upperGraphInfoBoxFontSize: 14,
    upperGraphInfoBoxBorderWidth: 10,
    upperGraphInfoBoxPadding: 10,
    upperGraphInfoBoxLineSpacing: 5,
    upperGraphInfoBoxLeftMargin: 30,
    upperGraphChartHeadingFontSize: 20,
    upperGraphTableSubHeadingFontSize: 12,
    upperGraphTableHeadingFontSize: 16,
    lowerGraphWidth: 700,
    lowerGraphHeight: 700,
    lowerGraphLeft: 60,
    lowerGraphRight: 400,
    lowerGraphTop: 60,
    lowerGraphBottom: 60,
    lowerGraphArcRadius: 65,
    lowerGraph2LevelFilterArcRadius: 80,
    lowerGraphCenterArcRadius: 45,
    lowerGraphCenterArcMargin: 1,
    lowerGraphCenterFontSize: 18,
    lowerGraphTooltipMinWidth: 140,
    lowerGraphTooltipFontSize: 12,
    lowerGraphTooltipTextPaddingHor: 5,
    lowerGraphTooltipTextPaddingVert: 3,
    lowerGraphTooltipHighlightWidth: 1,
    lowerGraphTooltipPaddingHor: 10,
    lowerGraphTooltipPaddingVert: 8,
    lowerGraphInfoBoxWidth: 240,
    lowerGraphInfoBoxHeight: 200,
    lowerGraphArcLabelFontSize: 12,
    lowerGraphArcPadding: 10,
    lowerGraphChartHeadingFontSize: 20,    
    lowerGraphInfoBoxFontSize: 14, 
    lowerGraphInfoBoxBorderWidth: 10,
    lowerGraphInfoBoxPadding: 10,
    lowerGraphInfoBoxLineSpacing: 10,
    lowerGraphTableSubHeadingFontSize: 12,
    lowerGraphTableHeadingFontSize: 16,
    legendFontSize: 12,
    legendSquareSize: 12,
    legendRowHeight: 20,
    tableSectionBorderLeft: "1px solid black",
});


// =================================================
// == Strings and Enums                           ==
// =================================================

// text wrap attributes
export const TextWrap  = {
    NoWrap: "No Wrap",
    Wrap: "Wrap"
};

// text anchor attributes
export const TextAnchor = {
    Start: "start",
    Middle: "middle",
    End: "end"
};

// font weight attributes
export const FontWeight = {
    Normal: "normal",
    Bold: "bold",
    Lighter: "lighter",
    Bolder: "bolder"
}

// mouse pointers
export const MousePointer = {
    Pointer: "pointer",
    Default: "default"
}

// default attributes used for different components
export const DefaultAttributes = {
    textAnchor: TextAnchor.Start,
    textWrap: TextWrap.Wrap,
    fontWeight: FontWeight.Normal,
    opacity: 1
}

// column names in the food description group csv file
// Note: For simplicity, should be the same for all languages since this is not displayed on the website
export const FoodGroupDescDataColNames = {
    foodGroupLv1: "Food Group Name_Level 1",
    foodGroupLv2: "Food Group Name_Level 2",
    foodGroupLv3: "Food Group Name_Level 3",
    description: "Description of the Contents of the Food Groups and Sub-groups"
};

// column names in the food ingredient csv file
// Note: For simplicity, should be the same for all languages since this is not displayed on the website
export const FoodIngredientDataColNames = {
    ageSexGroup: "Age-sex group (*: excludes pregnant or breastfeeding)",
    foodGroupLv1: "Food group_level1",
    foodGroupLv2: "Food group_level2",
    foodGroupLv3: "Food group_level3",
    amount: "Amount",
    amountSE: "Amount_SE",
    percentage: "Percentage",
    percentageSE: "Percentage_SE"

};

// Different display states of the sun burst graph
export const SunBurstStates = {
    AllDisplayed: "All Displayed",
    FilterOnlyLevel2: "Filter Only Level 2"
};


// Ordering for the headings of the age-sex groups
export const AgeSexGroupOrder = {};
AgeSexGroupOrder["Population1Up"] = 0;
AgeSexGroupOrder["Children1To8"] = 1;
AgeSexGroupOrder["YouthAndAdolescents"] = 2;
AgeSexGroupOrder["AdultMales"] = 3;
AgeSexGroupOrder["AdultFemales"] = 4;


// Translation: Helper class for doing translations
export class Translation {
    static register(resources){
        i18next.use(i18nextBrowserLanguageDetector).init({
            fallbackLng: "en",
            detection: {
                order: ['querystring', 'htmlTag', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'path', 'subdomain'],
            },
            resources: resources
        })
        i18next.changeLanguage();
    }
    
    static translate(key, args){
        return i18next.t(key, args)
    }
}


const REMPLACER_MOI = "REMPLACER MOI"
const REMPLACER_MOI_AVEC_ARGUMENTS = `${REMPLACER_MOI} - les arguments du texte: `

// translations for certain text used in the project
export const TranslationObj = {
    en: {
        translation: {
            // Names used for the legend
            // Note: Copy the exact food group lv1 name from the food ingredient CSV file
            LegendKeys: {
                "Baby Foods": "Baby Foods",
                "Beverages (Excluding Milks)": "Beverages (Excluding Milks)",
                "Dairy & Plant-Based Beverages": "Dairy & Plant-Based Beverages",
                "Fats & Oils": "Fats & Oils",
                "Fish & Seafood": "Fish & Seafood",
                "Fruits & Vegetables": "Fruits & Vegetables",
                "Grain Products": "Grain Products",
                "Meat & Poultry": "Meat & Poultry",
                "Meat Alternatives": "Meat Alternatives",
                "Nutritional Beverages & Bars": "Nutritional Beverages & Bars",
                "Soups - Sauces - Spices & Other Ingredients": "Soups - Sauces - Spices & Other Ingredients",
                "Sweets - Sugars & Savoury Snacks": "Sweets - Sugars & Savoury Snacks",
                "All Items": "All Food Groups"
            },

            // Names for the age-sex groups
            // Note: Copy the exact age-sex group name from the food description CSV file
            AgeSexGroupHeadings: {
                Population1Up: "Population age 1+", 
                Children1To8: "Children 1 to 8 y", 
                YouthAndAdolescents: "Youth & adolescents* 9 to 18 y",
                AdultMales: "Adult males 19 y +",
                AdultFemales: "Adult females* 19 y +"
            },

            // certain keys in the graph's food ingredient CSV file that do not map to
            //  any keys in the food description CSV file
            // Note: Copy the exact food group name from the food description CSV file
            FoodDescriptionExceptionKeys: {
                "Spices - Seasonings & Other Ingredients": {
                    "OtherNutrients": "Spices - Seasonings & Other Ingredients (all nutrients excluding sodium)",
                    "Sodium": "Spices - Seasonings & Other Ingredients (sodium only)"
                },

                "Vegetables Including Potatoes": {
                    "OtherNutrients": "Vegetables Including Potatoes (all nutrients excluding sodium)",
                    "Sodium": "Vegetables Including Potatoes (sodium only)"
                }
            },

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
                ],
                "tableSubHeadings": ["Amount (g)", "Amount SE", "% of total intake", "% SE"]
            },
            "lowerGraph": {
                "graphTitle": "Food groups and sub-groups contribution to {{ nutrient }} intake in Canadian {{ ageSexGroup }}",
                "graphFootnote": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
                "tableTitle": "Absolute ({{ amountUnit }}/day) and relative (%) contribution of food groups and sub-groups to daily {{nutrient}} intake in Canadian {{ ageSexGroup }}, 2015",
                "seeLevel2Groups": "Filter on level 2 groups",
                "seeAllGroups": "See all food groups",
                "allFoodGroupsLabel": "All Food Groups",
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
                "tableHeadings": ["Food Group Level 1", "Food Group Level 2", "Food Group Level 3", "Amount (g)", "Amount SE", "% of total intake", "% SE"]
            }
        }
    },
    fr: { 
        translation: {
            // Names used for the legend
            // Note: Copy the exact food group lv1 name from the source CSV files
            LegendKeys: {
                "Baby Foods": "Baby Foods",
                "Beverages (Excluding Milks)": "Beverages (Excluding Milks)",
                "Dairy & Plant-Based Beverages": "Dairy & Plant-Based Beverages",
                "Fats & Oils": "Fats & Oils",
                "Fish & Seafood": "Fish & Seafood",
                "Fruits & Vegetables": "Fruits & Vegetables",
                "Grain Products": "Grain Products",
                "Meat & Poultry": "Meat & Poultry",
                "Meat Alternatives": "Meat Alternatives",
                "Nutritional Beverages & Bars": "Nutritional Beverages & Bars",
                "Soups - Sauces - Spices & Other Ingredients": "Soups - Sauces - Spices & Other Ingredients",
                "Sweets - Sugars & Savoury Snacks": "Sweets - Sugars & Savoury Snacks",
                "All Items": "Toutes les Groupes Alimentaires"
            },

            // Names for the age-sex groups
            // Note: Copy the exact age-sex group name from the food description CSV file
            AgeSexGroupHeadings: {
                Population1Up: `Population age 1+`, 
                Children1To8: "Children 1 to 8 y", 
                YouthAndAdolescents: "Youth & adolescents* 9 to 18 y",
                AdultMales: "Adult males 19 y +",
                AdultFemales: "Adult females* 19 y +"
            },

            // certain keys in the graph's food ingredient CSV file that do not map to
            //  any keys in the food description CSV file
            // Note: Copy the exact food group names (for both keys and values) from the food description CSV file
            FoodDescriptionExceptionKeys: {
                "Spices - Seasonings & Other Ingredients": {
                    "OtherNutrients": "Spices - Seasonings & Other Ingredients (all nutrients excluding sodium)",
                    "Sodium": "Spices - Seasonings & Other Ingredients (sodium only)"
                },

                "Vegetables Including Potatoes": {
                    "OtherNutrients": "Vegetables Including Potatoes (all nutrients excluding sodium)",
                    "Sodium": "Vegetables Including Potatoes (sodium only)"
                }
            },

            "upperGraph": {
                "number": {
                    "graphTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ nutrient }} ({{ amountUnit }}/j)`,
                    "yAxisTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS} {{nutrient}} ({{ amountUnit }}/j)`,
                    "switchTypeButton": "Changer Au Pourcentage"
                },
                "percentage": {
                    "graphTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS}  {{ nutrient }}`,
                    "yAxisTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS}  {{nutrient}}`,
                    "switchTypeButton": "Changer Aux Nombres"
                },
                "graphFootnote": REMPLACER_MOI,
                "tableTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS} ({{ amountUnit }}/jour) {{nutrient}}`,   
                "infoBox_number": [
                    "{{- name }}",
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{amount}}`
                ],
                "infoBox_percentage": [
                    "{{- name }}",
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ percentage }}%  {{- nutrient }} `
                ],
                "tableSubHeadings": [REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI]
            },
            "lowerGraph": {
                "graphTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ nutrient }} {{ ageSexGroup }}`,
                "graphFootnote": REMPLACER_MOI,
                "tableTitle": `${REMPLACER_MOI_AVEC_ARGUMENTS} ({{ amountUnit }}/jour)  {{nutrient}}  {{ ageSexGroup }}`,
                "seeLevel2Groups": `Voyer les Groupes à Niveau 2`,
                "seeAllGroups": `Toutes les Groupes Alimentaires`,
                "infoBoxLevel_1": [
                    "{{- name }}",
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ percentage }}%  {{ nutrient }} `
                ],
                "infoBoxLevel_2": [
                    "{{- name }}",
                    REMPLACER_MOI,
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ nutrient }} {{ percentage }}%`,
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{- parentGroup }}  {{ parentPercentage }}%`
                ],
                "infoBoxLevel_3": [
                    "{{- name }}",
                    REMPLACER_MOI,
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ nutrient }} {{ percentage }}%`,
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{- parentGroup }}  {{ parentPercentage }}%`
                ],
                "infoBoxLevel_4": [
                    "{{- name }}",
                    REMPLACER_MOI,
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ nutrient }} {{ percentage }}%`,
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{- parentGroup }}  {{ parentPercentage }}%`
                ],
                /* If the context number is not between 1-4 */
                "hoverBoxLevel_other": [ 
                    "{{- name }}",
                    `${REMPLACER_MOI_AVEC_ARGUMENTS} {{ percentage }}% {{ nutrient }}`
                ],
                "tableHeadings": [REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI, REMPLACER_MOI]
            }
        }
    }
}