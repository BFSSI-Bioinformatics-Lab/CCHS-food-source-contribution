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
    "Meat Alternatives": "#AC7339",
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
    upperGraphFooter: 50,
    upperGraphBarWidth: 100,
    upperGraphTooltipMinWidth: 140,
    upperGraphAxesFontSize: 20,
    upperGraphXAxisTickFontSize: 13,
    upperGraphYAxisTickFontSize: 14,
    upperGraphTooltipFontSize: 14,
    upperGraphTooltipPaddingVert: 8,
    upperGraphTooltipPaddingHor: 10,
    upperGraphTooltipTitleMarginBtm: 10,
    upperGraphTooltipTextPaddingHor: 5,
    upperGraphTooltipTextPaddingVert: 3,
    upperGraphTooltipHighlightWidth: 1,
    upperGraphTooltipHeight: 50,
    upperGraphTooltipBorderWidth: 3,
    upperGraphInfoBoxWidth: 240,
    upperGraphInfoBoxHeight: 224,
    upperGraphInfoBoxFontSize: 15,
    upperGraphInfoBoxTitleFontSize: 18,
    upperGraphInfoBoxBorderWidth: 10,
    upperGraphInfoBoxPadding: 10,
    upperGraphInfoBoxTitleMarginBtm: 15,
    upperGraphInfoBoxLineSpacing: 5,
    upperGraphInfoBoxLeftMargin: 30,
    upperGraphChartHeadingFontSize: 20,
    upperGraphTableSubHeadingFontSize: 12,
    upperGraphTableHeadingFontSize: 16,
    upperGraphFooterFontSize: 12,
    upperGraphFooterPaddingHor: 10,
    upperGraphFootNoteSpacing: 10,
    lowerGraphWidth: 700,
    lowerGraphHeight: 600,
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
    lowerGraphTooltipFontSize: 14,
    lowerGraphTooltipTextPaddingHor: 5,
    lowerGraphTooltipTextPaddingVert: 3,
    lowerGraphTooltipHighlightWidth: 1,
    lowerGraphTooltipPaddingHor: 10,
    lowerGraphTooltipPaddingVert: 8,
    lowerGraphTooltipHeight: 50,
    lowerGraphTooltipBorderWidth: 3,
    lowerGraphTooltipTitleMarginBtm: 10,
    lowerGraphInfoBoxWidth: 240,
    lowerGraphInfoBoxHeight: 224,
    lowerGraphArcLabelFontSize: 14,
    lowerGraphArcLabelLetterSpacing: 1,
    lowerGraphArcPadding: 10,
    lowerGraphChartHeadingFontSize: 20,    
    lowerGraphInfoBoxFontSize: 15,
    lowerGraphInfoBoxTitleFontSize: 18,
    lowerGraphInfoBoxBorderWidth: 10,
    lowerGraphInfoBoxPadding: 10,
    lowerGraphInfoBoxLineSpacing: 10,
    lowerGraphInfoBoxTitleMarginBtm: 15,
    lowerGraphTableSubHeadingFontSize: 12,
    lowerGraphTableHeadingFontSize: 16,
    lowerGraphFooterFontSize: 12,
    lowerGraphFooterPaddingHor: 10,
    lowerGraphFootNoteSpacing: 10,
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
    percentageSE: "Percentage_SE",
    interpretationNotes: "Interpretation_Notes",
    articleGroupLv1: "Article_group1",
    articleGroupLv2: "Article_group2",
    articleGroupLv3: "Article_group3",
    foodGroupDepth: "Food_Group_Level"
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

// Different states for sorting tables
export const SortStates = {
    Unsorted: "unsorted",
    Ascending: "ascending",
    Descending: "descending",

    getNext: function(sortState) {
        if (sortState == SortStates.Unsorted) return SortStates.Ascending
        else if (sortState == SortStates.Ascending) return SortStates.Descending
        else return SortStates.Unsorted;
    }
};

// icons for the different sorting states
export const SortIconClasses = {};
SortIconClasses[SortStates.Unsorted] = "fa fa-sort"
SortIconClasses[SortStates.Ascending] = "fa fa-sort-amount-down"
SortIconClasses[SortStates.Descending] = "fa fa-sort-amount-up"

// column index for the "Food Group Level 3" column of the sunburst graph's table
export const LowerGraphFoodGroupLv3ColInd = 2;
export const LowerGraphAllDataColInd = {
    FoodGroupLv2: 2,
    FoodGroupLv3: 3
};


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
    
    // Note:
    // For some food groups with special characters like "Fruits & Vegetables", we want the title to be displayed as "Fruits & Vegetables" instead of "Fruits &amp; Vegatables"
    //  After passing in the food group into the i18next library, the library encoded the food group to be "Fruits &amp; Vegatables"
    // So all the special characters got encoded to their corresponding HTML Entities (eg. &lt; , &gt; , &quot;)
    //
    // So we need to decode back the encoded string with HTML entities to turn back "Fruits &amp; Vegetables" to "Fruits & Vegetables"
    static translate(key, args){
        const result = i18next.t(key, args);

        if (typeof result !== 'string') return result;
        return he.decode(result);
    }

    // translateNumStr(numStr, decimalPlaces): Translate a number to its correct
    //  numeric represented string for different languages
    // eg. '1.2' -> '1,2' in French
    //
    // Note:
    //  See https://www.i18next.com/translation-function/formatting for more formatting
    static translateNum(numStr, decimalPlaces = 1) {
        let num = Number(numStr);
        if (Number.isNaN(num)) return numStr;

        let translateArgs = {num}
        if (decimalPlaces) {
            translateArgs["minimumFractionDigits"] = decimalPlaces;
            translateArgs["maximumFractionDigits"] = decimalPlaces;
        }

        return this.translate("Number", translateArgs);
    }
}


const REMPLACER_MOI = "REMPLACER MOI"
const REMPLACER_MOI_AVEC_ARGUMENTS = `${REMPLACER_MOI} - les arguments du texte: `

// translations for certain text used in the project
export const TranslationObj = {
    en: {
        translation: {
            Number: "{{num, number}}",

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
                "All Items": "All Food Groups (Reset)"
            },

            // Variable names for the legend
            // Note: Copy the exact food group lv1 name from from the food ingredient CSV file to the keys of the dictionary
            LegendKeyVars: {
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
            // Note: Copy the exact food group name from the food description CSV file,
            //  then convert the name to lowercase without any trailing/leading spaces
            FoodDescriptionExceptionKeys: {
                "spices - seasonings & other ingredients": {
                    "OtherNutrients": "Spices - Seasonings & Other Ingredients (all nutrients excluding sodium)",
                    "Sodium": "Spices - Seasonings & Other Ingredients (sodium only)"
                },

                "vegetables including potatoes": {
                    "OtherNutrients": "Vegetables Including Potatoes (all nutrients excluding sodium)",
                    "Sodium": "Vegetables Including Potatoes (sodium only)"
                }
            },
            
            // Footnotes used in graphs and tables
            "FootNotes": {
                "EInterpretationNote": "E: Data with a coefficient of variation (CV) from 16.6% to 33.3%; interpret with caution.", 
                "FInterpretationNote": "F: Data with a CV greater than 33.3% with a 95% confidence interval not entirely between 0 and 3%; suppressed due to extreme sampling variability.", 
                "XInterpretationNote": "X: Food with less than 10 eaters; suppressed to meet confidentiality requirements.", 
                "excludePregnantAndLactating": "*Excludes pregnant and lactating women",
                "sourceText": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
            },

            // title for the popup tables on the website
            "popUpTableTitle": "Table: {{title}}",

            // title for the infobox
            "infoBoxTitle": "Food Group Description",

            "upperGraph": {
                "number": {
                    "graphTitle": "Contribution of 12 food groups to {{ nutrient }} daily {{ amountUnit }}/d and % of total intake",
                    "yAxisTitle": "{{nutrient}} Intake ({{ amountUnit }}/d)",
                    "switchTypeButton": "Switch to Percentage"
                },
                "percentage": {
                    "graphTitle": "Percentage of total {{ nutrient }} intake provided by" +
                        " 12 food groups",
                    "yAxisTitle": "% of total {{nutrient}} intake",
                    "switchTypeButton": "Switch to Numbers"
                },
                "tableTitle": "Contribution of 12 food groups to {{ nutrient }} daily {{ amountUnit }}/d and % of total intake",
                "toolTipTitle": "{{- name }}",
                "toolTip_number": [
                    "Amount: {{amount}} {{ unit }}"
                ],
                "toolTip_numberOnlyInterpretation": [
                    "Amount: {{ interpretationValue }}"
                ],
                "toolTip_numberWithInterpretation": [
                    "Amount: {{amount}} {{ unit }} {{ interpretationValue }}"
                ],
                "toolTip_percentage": [
                    "{{ percentage}}%"
                ],
                "toolTip_percentageOnlyInterpretation": [
                    "{{ interpretationValue }}"
                ],
                "toolTip_percentageWithInterpretation": [
                    "{{ percentage}}% {{ interpretationValue }}"
                ],
                "tableSubHeadingFirstCol": "Food Group",
                "tableSubHeadings": ["Amount ({{unit}})", "Amount SE", "% of total intake", "% SE"],

                // widths for the labels on the x-axis of the graph
                "upperGraphXAxisTickWidths": {
                    "Population1Up": 140,
                    "Children1To8": 140,
                    "YouthAndAdolescents": 130,
                    "AdultMales": 140,
                    "AdultFemales": 140
                } 
            },
            "lowerGraph": {
                "graphTitle": {
                    "OtherAgeGroups": {
                        "All Items": "Contribution of food groups and sub-groups to {{nutrient}} intake in {{ ageSexGroup }}",
                        "Filtered Data": "Contribution of {{ foodGroup }} to {{nutrient}} intake in {{ ageSexGroup }}",
                        "Filter Only Level 2": "Level 2 sub-groups contribution to {{nutrient}} intake in {{ ageSexGroup }}"
                    },

                    "Population1Up": {
                        "All Items": "Contribution of food groups and sub-groups to {{nutrient}} intake in Canadians, 1 year and over",
                        "Filtered Data": "Contribution of {{ foodGroup }} to {{nutrient}} intake in Canadians, 1 year and over",
                        "Filter Only Level 2": "Level 2 sub-groups contribution to {{nutrient}} intake in Canadians, 1 year and over"
                    }
                },
                "tableTitle": {
                    "OtherAgeGroups": {
                        "All Items": "Contribution of food groups and sub-groups to {{nutrient}} intake in {{ ageSexGroup }}",
                        "Filtered Data": "Contribution of {{ foodGroup }} to {{nutrient}} intake in {{ ageSexGroup }}",
                        "Filter Only Level 2": "Level 2 sub-groups contribution to {{nutrient}} intake in {{ ageSexGroup }}"
                    },

                    "Population1Up": {
                        "All Items": "Contribution of food groups and sub-groups to {{nutrient}} intake in Canadians, 1 year and over",
                        "Filtered Data": "Contribution of {{ foodGroup }} to {{nutrient}} intake in Canadians, 1 year and over",
                        "Filter Only Level 2": "Level 2 sub-groups contribution to {{nutrient}} intake in Canadians, 1 year and over"
                    }
                },
                "allItems": "All Food Groups",
                "seeLevel2Groups": "Show Sub-groups Only",
                "seeAllGroups": "Show All Food Groups",
                "allFoodGroupsLabel": "All Food Groups",
                "toolTipTitle": "{{- name }}",
                "toolTip": [
                    "{{ percentage }}% of {{ nutrient }} intake"
                ],
                "toolTip_OnlyInterpretation": [
                    "{{ interpretationValue }}"
                ],
                "toolTip_WithInterpretation": [
                    "{{ percentage }}% {{ interpretationValue }} of {{ nutrient }} intake"
                ],
                "tableHeadings": ["Food Group Level 1", "Food Group Level 2", "Food Group Level 3", "Amount ({{unit}})", "Amount SE", "% of total intake", "% SE"],
                "tableAllDataHeadings": ["Age-sex Group", "Food Group Level 1", "Food Group Level 2", "Food Group Level 3", "Amount ({{unit}})", "Amount SE", "% of total intake", "% SE"],
                "allDataCSVFileName": {
                    "All Displayed": "Contribution of food groups and sub-groups to {{nutrient}} intake",
                    "Filter Only Level 2": "Contribution of level 2 food groups to {{nutrient}} intake" 
                }
            }
        }
    },
    fr: { 
        translation: {
            Number: "{{num, number}}",

            // Names used for the legend
            // Note: Copy the exact food group lv1 name from the source CSV files
            LegendKeys: {
                "Baby Foods": "Aliments pour bébés",
                "Beverages (Excluding Milks)": "Boissons (excluant laits)",
                "Dairy & Plant-Based Beverages": "Produits laitiers et Boissons à base de plantes",
                "Fats & Oils": "Graisses et huiles",
                "Fish & Seafood": "Poissons et fruits de mer",
                "Fruits & Vegetables": "Fruits et légumes",
                "Grain Products": "Produits céréaliers",
                "Meat & Poultry": "Viandes et volailles",
                "Meat Alternatives": "Substituts de viande",
                "Nutritional Beverages & Bars": "Boissons et barres nutritionnelles",
                "Soups - Sauces - Spices & Other Ingredients": "Soupes - sauces - épices et autres ingrédients",
                "Sweets - Sugars & Savoury Snacks": "Confiserie - sucres et grignotines salées",
                "All Items": "Tous les groupes d’aliments (réinitialiser)"
            },

            // Variable names for the legend
            // Note: Copy the exact food group lv1 name from from the food ingredient CSV file to the keys of the dictionary
            LegendKeyVars: {
                "Aliments pour bébés": "Baby Foods",
                "Boissons (excluant laits)": "Beverages (Excluding Milks)",
                "Produits laitiers et Boissons à base de plantes": "Dairy & Plant-Based Beverages",
                "Graisses et huiles": "Fats & Oils",
                "Poissons et fruits de mer": "Fish & Seafood",
                "Fruits et légumes": "Fruits & Vegetables",
                "Produits céréaliers": "Grain Products",
                "Viandes et volailles": "Meat & Poultry",
                "Substituts de viande": "Meat Alternatives",
                "Boissons et barres nutritionnelles": "Nutritional Beverages & Bars",
                "Soupes - sauces - épices et autres ingrédients": "Soups - Sauces - Spices & Other Ingredients",
                "Confiserie - sucres et grignotines salées": "Sweets - Sugars & Savoury Snacks",
            },

            // Names for the age-sex groups
            // Note: Copy the exact age-sex group name from the food description CSV file
            AgeSexGroupHeadings: {
                Population1Up: "Population 1 an et +", 
                Children1To8: "Enfants 1 à 8 ans", 
                YouthAndAdolescents: "Jeunes et adolescents* 9 à 18 ans",
                AdultMales: "Hommes adultes 19 ans +",
                AdultFemales: "Femmes adultes* 19 ans +"
            },

            // certain keys in the graph's food ingredient CSV file that do not map to
            //  any keys in the food description CSV file
            // Note: Copy the exact food group names (for both keys and values) from the food description CSV file, 
            //  then convert the name to lowercase without any trailing/leading spaces
            FoodDescriptionExceptionKeys: {
                "épices - assaisonnements et autres ingrédients": {
                    "OtherNutrients": "Épices - assaisonnements et autres ingrédients  (tous les nutriments excluant sodium)",
                    "Sodium": "Épices - assaisonnements et autres ingrédients (sodium uniquement)"
                },

                "légumes incluant pommes de terre": {
                    "OtherNutrients": "Légumes incluant pommes de terre (tous les nutriments excluant sodium)",
                    "Sodium": "Légumes incluant pommes de terre  (sodium uniquement)"
                }
            },

            // Footnotes used in graphs and tables
            "FootNotes": {
                "EInterpretationNote": "E: Données dont le coefficient de variation (CV) se situe entre 16,6 % à 33,3 %; interpréter avec prudence.", 
                "FInterpretationNote": "F: Données dont le CV est supérieur à 33, 3%, avec un intervalle de confiance de 95% pas entièrement compris ", 
                "XInterpretationNote": "X: Groupe d’aliment avec moins de 10 mangeurs ; supprimé pour des raisons de confidentialité.", 
                "excludePregnantAndLactating": "*Exclut les femmes enceintes et allaitantes",
                "sourceText": "Source des données : Statistique Canada, Enquête sur la santé dans les collectivités canadiennes 2015 - Nutrition, 2015, Fichier partagé.",
            },

            // title for the popup tables on the website
            "popUpTableTitle": `Tableau: {{title}}`,

            // title for the infobox
            "infoBoxTitle": "Description des Groupes d'Aliments",

            "upperGraph": {
                "number": {
                    "graphTitle": `Contribution de 12 groupes d'aliments à l'apport quotidien en {{ nutrient }} {{ amountUnit }}/j et % de l'apport total`,
                    "yAxisTitle": `Apports en {{nutrient}} ({{ amountUnit }}/j)`,
                    "switchTypeButton": "Afficher les pourcentages "
                },
                "percentage": {
                    "graphTitle": `Contribution de 12 groupes d'aliments à l'apport quotidien en {{ nutrient }} {{ amountUnit }}/j et % de l'apport total`,
                    "yAxisTitle": `% de l'apport total en {{nutrient}}`,
                    "switchTypeButton": "Afficher les nombres"
                },
                "tableTitle": `Contribution de 12 groupes d'aliments à l'apport quotidien en {{nutrient}} ({{ amountUnit }}/jour) et % de l'apport total`,   
                "toolTipTitle": "{{- name }}",
                "toolTip_number": [
                    `Quantité: {{amount }} {{ unit }}`
                ],
                "toolTip_numberOnlyInterpretation": [
                    "Quantité: {{ interpretationValue }}"
                ],
                "toolTip_numberWithInterpretation": [
                    "Quantité: {{amount}} {{ unit }} {{ interpretationValue }}"
                ],
                "toolTip_percentage": [
                    `{{ percentage }}%`
                ],
                "toolTip_percentageOnlyInterpretation": [
                    "{{ interpretationValue }}"
                ],
                "toolTip_percentageWithInterpretation": [
                    "{{ percentage }}% {{ interpretationValue }}"
                ],
                "tableSubHeadingFirstCol": "Groupe d'Aliments",
                "tableSubHeadings": ["Moyenne ({{unit}})", "ET Moyenne", "% de l'Apport Total", "ET %"],

                // widths for the labels on the x-axis of the graph
                "upperGraphXAxisTickWidths": {
                    "Population1Up": 140,
                    "Children1To8": 140,
                    "YouthAndAdolescents": 140,
                    "AdultMales": 110,
                    "AdultFemales": 110
                } 
            },
            "lowerGraph": {
                "graphTitle": {
                    "OtherAgeGroups": {
                        "All Items": `Contribution des groupes et sous-groupes d’aliments à l'apport en {{nutrient}} chez les {{ ageSexGroup }}`,
                        "Filtered Data": `Contribution {{article}} {{ foodGroup }} à l'apport en {{nutrient}} chez les {{ ageSexGroup }}`,
                        "Filter Only Level 2": `Contribution des sous-groupes de niveau 2 à l'apport en {{nutrient}} chez les {{ ageSexGroup }}`
                    },

                    "Population1Up": {
                        "All Items": `Contribution des groupes et sous-groupes d’aliments à l'apport en {{nutrient}} chez les Canadiens âgés de 1 an et plus`,
                        "Filtered Data": `Contribution {{article}} {{ foodGroup }} à l'apport en {{nutrient}} chez les Canadiens âgés de 1 an et plus`,
                        "Filter Only Level 2": `Contribution des sous-groupes de niveau 2 à l'apport en {{nutrient}} chez les Canadiens âgés de 1 an et plus`
                    }
                },
                "tableTitle": {
                    "OtherAgeGroups": {
                        "All Items": `Contribution des groupes et sous-groupes d’aliments à l'apport en {{nutrient}} chez les {{ ageSexGroup }}`,
                        "Filtered Data": `Contribution {{article}} {{ foodGroup }} à l'apport en {{nutrient}} chez les {{ ageSexGroup }}`,
                        "Filter Only Level 2": `Contribution des sous-groupes de niveau 2 à l'apport en {{nutrient}} chez les {{ ageSexGroup }}`
                    },

                    "Population1Up": {
                        "All Items": `Contribution des groupes et sous-groupes d’aliments à l'apport en {{nutrient}} chez les Canadiens âgés de 1 an et plus`,
                        "Filtered Data": `Contribution {{article}} {{ foodGroup }} à l'apport en {{nutrient}} chez les Canadiens âgés de 1 an et plus`,
                        "Filter Only Level 2": `Contribution des sous-groupes de niveau 2 à l'apport en {{nutrient}} chez les Canadiens âgés de 1 an et plus`
                    }
                },
                "allItems": "Tous les groupes d’aliments",
                "seeLevel2Groups": "Afficher sous-groupes uniquement",
                "seeAllGroups": "Afficher tous les groupes",
                "toolTipTitle": "{{- name }}",
                "toolTip": [
                    `{{ percentage }}% de l'apport en {{nutrient}}`
                ],
                "toolTip_OnlyInterpretation": [
                    "{{ interpretationValue }}"
                ],
                "toolTip_WithInterpretation": [
                    `{{ percentage }}% {{ interpretationValue }} de l'apport en {{nutrient}}`
                ],
                "tableHeadings": ["Groupe d'Aliments Niveau 1", "Groupe d'Aliments Niveau 2", "Groupe d'Aliments Niveau 3", "Moyenne ({{unit}})", "ET Moyenne", "% de l'Apport Total", "ET %"],
                "tableAllDataHeadings": ["Groupe Âge-sexe", "Groupe d'Aliments Niveau 1", "Groupe d'Aliments Niveau 2", "Groupe d'Aliments Niveau 3", "Moyenne ({{unit}})", "ET Moyenne", "% de l'Apport Total", "ET %"],

                "allDataCSVFileName": {
                    "All Displayed": `Contribution des groupes et sous-groupes d’aliments à l'apport en {{nutrient}}`,
                    "Filter Only Level 2": `Contribution des sous-groupes de niveau 2 à l'apport en {{nutrient}}`
                }
            }
        }
    }
}