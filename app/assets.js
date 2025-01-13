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


// ================== TOOLS/UTILITIES ====================================

// DictTools: Class for handling dictionaries
export class DictTools {

    // invert(dict): Inverts a dictionary (keys become values and values become keys)
    static invert(dict) {
        return Object.fromEntries(Object.entries(dict).map(([key, value]) => [value, key]));
    }
}

// =======================================================================

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
    "Baby Foods": "#CEC3E5",
    "Beverages (Excluding Milks)": "#FADB51",
    "Dairy & Plant-Based Beverages": "#5DCCEB",
    "Fats & Oils": "#E4C9A4",
    "Fish & Seafood": "#FF8D8D",
    "Fruits & Vegetables": "#61DD73",
    "Grain Products": "#F48021",
    "Meat & Poultry": "#CF4646",
    "Meat Alternatives": "#C4955D",
    "Nutritional Beverages & Bars": "#A4F5DC",
    "Soups - Sauces - Spices & Other Ingredients": "#0082DE",
    "Sweets - Sugars & Savoury Snacks": "#A270DE",
    "All Items": "#A1A1A1"
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
    lowerGraphInfoBoxMarginBtm: 80,
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


// ================= ENGLISH TRANSLATIONS =======================

// Names used for the legend
// Note: Copy the exact food group lv1 name from the food ingredient CSV file
const LegendKeysEN = {
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
}

const LegendKeyVarsEN = DictTools.invert(LegendKeysEN);


const LangEN = {
    translation: {
        Number: "{{num, number}}",
        LegendKeys: LegendKeysEN,
        LegendKeyVars: LegendKeyVarsEN,
        "and": "and",

        // Names for the age-sex groups
        // Note: Copy the exact age-sex group name from the food description CSV file
        AgeSexGroupHeadings: {
            Population1Up: "Population age 1+", 
            Children1To8: "Children 1 to 8 y", 
            YouthAndAdolescents: "Youth & adolescents* 9 to 18 y",
            AdultMales: "Adult males 19 y +",
            AdultFemales: "Adult females* 19 y +"
        },

        // The pretty display for the age-sex group
        ageSexGroupDisplay: {
            Population1Up: "Population age 1+", 
            Children1To8: "Children 1 to 8 years", 
            YouthAndAdolescents: "Youth & adolescents* 9 to 18 years",
            AdultMales: "Adult males 19 years +",
            AdultFemales: "Adult females* 19 years +" 
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
            "EInterpretationNote": "E: Data with a coefficient of variation (CV) from 16.6 % to 33.3 %; interpret with caution.", 
            "FInterpretationNote": "F: Data with a CV greater than 33.3 % suppressed due to extreme sampling variability.",
            "XInterpretationNote": "X: Food with less than 10 eaters; suppressed to meet confidentiality requirements.", 
            "excludePregnantAndLactating": "*Excludes pregnant and lactating women",
            "sourceText": "Data Source: Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
        },

        // title for the popup tables on the website
        "popUpTableTitle": "Table: {{title}}",

        // title for the infobox
        "infoBoxTitle": "Food group description",

        "upperGraph": {
            "number": {
                "graphTitle": "Contribution of 12 food groups to daily intakes of {{ nutrient }} ({{ amountUnit }}/d and percentage (%) of total intake)",
                "yAxisTitle": "{{nutrient}} Intake ({{ amountUnit }}/d)",
                "switchTypeButton": "Switch to percentage"
            },
            "percentage": {
                "graphTitle": "Contribution of 12 food groups to daily intakes of {{ nutrient }} ({{ amountUnit }}/d and percentage (%) of total intake)",
                "yAxisTitle": "% of total {{nutrient}} intake",
                "switchTypeButton": "Switch to numbers"
            },
            "tableTitle": "Contribution of 12 food groups to daily intakes of {{ nutrient }} ({{ amountUnit }}/d and percentage (%) of total intake)",
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
                "{{ percentage}} %"
            ],
            "toolTip_percentageOnlyInterpretation": [
                "{{ interpretationValue }}"
            ],
            "toolTip_percentageWithInterpretation": [
                "{{ percentage}} % {{ interpretationValue }}"
            ],
            "tableSubHeadingFirstCol": "Food group",
            "tableSubHeadings": ["Amount ({{unit}})", "Amount SE", "Percentage of total intake (%)", "Percentage SE (%)"],

            // widths for the labels on the x-axis of the graph
            "upperGraphXAxisTickWidths": {
                "Population1Up": 140,
                "Children1To8": 140,
                "YouthAndAdolescents": 130,
                "AdultMales": 140,
                "AdultFemales": 100
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
            "allItems": "All food groups",
            "seeLevel2Groups": "Show sub-groups Only",
            "seeAllGroups": " Show all food groups",
            "toolTipTitle": "{{- name }}",
            "toolTip": [
                "{{ percentage }} % of {{ nutrient }} intake"
            ],
            "toolTip_OnlyInterpretation": [
                "{{ interpretationValue }}"
            ],
            "toolTip_WithInterpretation": [
                "{{ percentage }} % {{ interpretationValue }} of {{ nutrient }} intake"
            ],
            "tableHeadings": ["Food group level 1", "Food group level 2", "Food group level 3", "Amount ({{unit}})", "Amount SE", "Percentage of total intake (%)", "Percentage SE (%)"],
            "tableAllDataHeadings": ["Age-sex Group", "Food group level 1", "Food group level 2", "Food group level 3", "Amount ({{unit}})", "Amount SE", "Percentage of total intake (%)", "Percentage SE (%)"],
            "allDataCSVFileName": {
                "All Displayed": "Contribution of food groups and sub-groups to {{nutrient}} intake",
                "Filter Only Level 2": "Contribution of level 2 food groups to {{nutrient}} intake" 
            }
        },

        NotesAndLegend: {
            "NotesAndLegendDataSourceSubtitle": "Data Source",
            "NotesAndLegendDataSourceDesc": "Statistics Canada, 2015 Canadian Community Health Survey - Nutrition, 2015, Share File.",
            "NotesAndLegendOpenDataSubTitle": "Food Source Contribution Table on Open Data",
            "NotesAndLegendOpenDataDesc": `
                Data for additional age-sex groups can be found in the
                <a
                href="https://open.canada.ca/data/en/dataset/b166b1c1-0313-4706-8cca-f464f6fc7086"
                target="_blank">Food source contribution table
                </a> available on the Government of Canada’s Open Data portal.`,
            "NotesAndLegendDataInterpretationSubtitle": "Interpretation of data",
            "NotesAndLegendDataInterpretationDesc": `
                Foods that are known to be rich sources of a nutrient may
                not be a major contributor to population intakes of that
                nutrient if they are consumed in low amounts. On the other
                hand, some less nutrient-dense foods may make a large
                contribution to population intakes simply because they
                are widely consumed and/or consumed in large amounts.`,
            "NotesAndLegendDataAboutGraphSubtitle": "About the graphs and tables",
            "NotesAndLegendDataAboutGraphDescHeadingRecipe": "Recipe Analysis:",
            "NotesAndLegendDataAboutGraphDescRecipe1": `
                The Food source contribution tool food groups were generated by combining foods consumed as a food 
                on its own or as an ingredient. For example, looking at the egg category, the contribution of eggs 
                is based on the total consumption of eggs coming from hard-boiled eggs (food) and eggs used in recipes 
                such as quiches, homemade cakes, etc. The contribution of some ingredients such as eggs, sugar, flour, 
                etc. may be underestimated due to the inability to break down some commercial food products.`,
            "NotesAndLegendDataAboutGraphDescRecipe2": `
                If interested, a second dataset that analyzes recipes as a
                whole along with food consumed on its own is also available
                on the
                <a
                href="https://open.canada.ca/data/en/dataset/b166b1c1-0313-4706-8cca-f464f6fc7086"
                target="_blank">Government of Canada’s Open data portal</a>.`,
            "NotesAndLegendDataAboutGraphDescHeadingFood": "Food Groups:",
            "NotesAndLegendDataAboutGraphDescFood": "Estimates were generated for three different levels of food groupings based on the food group list from the Bureau of Nutritional Sciences (BNS) with some modifications.",
            "NotesAndLegendDataAboutGraphDescHeadingEstimate": "Estimates:",
            "NotesAndLegendDataAboutGraphDescEstimate1": `
                All estimates were obtained from the first 24-hour dietary
                recall. The estimate 0.0% refers to values smaller than 0.1%`,
            "NotesAndLegendDataAboutGraphDescEstimate2": `
                For more information please consult the
                <a
                href="https://open.canada.ca/data/en/dataset/b166b1c1-0313-4706-8cca-f464f6fc7086/resource/7cb83e8a-943e-4ffc-a833-c9c25ef39bad"
                target="_blank">Food source contribution table (FSCT) – User guide</a>.`,
            "NotesAndLegendDataAboutCCHSSubtitle": "About the 2015 Canadian Community Health Survey – Nutrition (CCHS –Nutrition)",
            "NotesAndLegendDataAboutCCHSDesc1": `
                The 2015 CCHS-Nutrition is a nationally representative survey of
                the nutrition of people in Canada. The survey provides
                detailed information on food consumption using a 24-hour
                dietary recall for the total sample and a repeat sub-sample,
                dietary supplement intake, physical measurements, household
                food insecurity, and other topics that support the
                interpretation of the 24-hour recall. The survey excludes
                those living in the three territories, individuals living
                on reserves, residents of institutions, full‐time members of
                the Canadian Armed Forces and residents of certain remote regions.`,
            "NotesAndLegendDataAboutCCHSDesc2": `
                For more information on CCHS - Nutrition, please consult the
                <a
                href="https://www.canada.ca/en/health-canada/services/food-nutrition/food-nutrition-surveillance/health-nutrition-surveys/canadian-community-health-survey-cchs/reference-guide-understanding-using-data-2015.html"
                target="_blank">Reference guide to understanding and using the data</a>.`,
            "NotesAndLegendDataLegendSubtitle": "Legend",
            "NotesAndLegendDataLegendDesc1": `
                <dt>E:</dt>
                <dd>Data with a coefficient of variation (CV) from 16.6% to 33.3%; interpret with caution.</dd>

                <dt class="mrgn-tp-sm">F:</dt>
                <dd>Data with a CV greater than 33.3% suppressed due to extreme sampling variability.</dd>

                <dt class="mrgn-tp-sm">X:</dt>
                <dd>Food with less than 10 eaters; suppressed to meet confidentiality requirements.</dd>

                <dt class="mrgn-tp-sm">D:</dt>
                <dd>Day</dd>

                <dt class="mrgn-tp-sm">DFE:</dt>
                <dd>Dietary folate equivalent</dd>

                <dt class="mrgn-tp-sm">g:</dt>
                <dd>Gram</dd>

                <dt class="mrgn-tp-sm">kcal:</dt>
                <dd>Kilocalories</dd>

                <dt class="mrgn-tp-sm">mcg:</dt>
                <dd>Microgram</dd>

                <dt class="mrgn-tp-sm">mg:</dt>
                <dd>Milligram</dd>

                <dt class="mrgn-tp-sm">n:</dt>
                <dd>Sample size</dd>

                <dt class="mrgn-tp-sm">SE:</dt>
                <dd>Standard Error</dd>`,
            "NotesAndLegendDataLegendDesc2": "<i>* Excludes pregnant and lactating women</i>",
            "NotesAndLegendDataCitationSubtitle": "Suggested citation",
            "NotesAndLegendDataCitationDesc": `
                Health Canada (2023). Food Source Contribution Table derived
                from Statistics Canada's 2015 Canadian Community Health Survey, Nutrition, Share file. Ottawa.`,
            "NotesAndLegendDataCorrespondenceSubtitle": "Correspondence",
            "NotesAndLegendDataCorrespondenceDesc": `
                Bureau of Data, Science and Knowledge Integration, Food and
                Nutrition Directorate, Health Canada, 251 Sir Frederick
                Banting Driveway, A.L. 2201E, Ottawa, ON K1A 0K9; Email: nutrition.surveillance-nutritionnelle@hc-sc.gc.ca`
        }
    }
}

// ==============================================================
// ============== FRENCH TRANSLATIONS ===========================

const REMPLACER_MOI = "REMPLACER MOI"
const REMPLACER_MOI_AVEC_ARGUMENTS = `${REMPLACER_MOI} - les arguments du texte: `

// Names used for the legend
// Note: Copy the exact food group lv1 name from the source CSV files
const LegendKeysFR = {
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
}

const LegendKeyVarsFR = DictTools.invert(LegendKeysFR);

const LangFR = { 
    translation: {
        Number: "{{num, number}}",
        LegendKeys: LegendKeysFR,
        LegendKeyVars: LegendKeyVarsFR,
        "and": "et",

        // Names for the age-sex groups
        // Note: Copy the exact age-sex group name from the food description CSV file
        AgeSexGroupHeadings: {
            Population1Up: "Population 1 an et +", 
            Children1To8: "Enfants 1 à 8 ans", 
            YouthAndAdolescents: "Jeunes et adolescents* 9 à 18 ans",
            AdultMales: "Hommes adultes 19 ans +",
            AdultFemales: "Femmes adultes* 19 ans +"
        },

        // The pretty display for the age-sex group
        ageSexGroupDisplay: {
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
            "FInterpretationNote": "F: Données dont le CV est supérieur à 33,3 % supprimées en raison de l'extrême variabilité d'échantillonnage.", 
            "XInterpretationNote": "X: Groupe d’aliment avec moins de 10 mangeurs ; supprimé pour des raisons de confidentialité.", 
            "excludePregnantAndLactating": "*Exclut les femmes enceintes et allaitantes",
            "sourceText": "Source des données : Statistique Canada, Enquête sur la santé dans les collectivités canadiennes 2015 - Nutrition, 2015, Fichier partagé.",
        },

        // title for the popup tables on the website
        "popUpTableTitle": `Tableau: {{title}}`,

        // title for the infobox
        "infoBoxTitle": "Description des groupes d'aliments",

        "upperGraph": {
            "number": {
                "graphTitle": `Contribution de 12 groupes d’aliments à l’apport quotidien en {{ nutrient }} ({{ amountUnit }}/j et pourcentage (%) de l'apport total)`,
                "yAxisTitle": `Apports en {{nutrient}} ({{ amountUnit }}/j)`,
                "switchTypeButton": "Afficher les pourcentages "
            },
            "percentage": {
                "graphTitle": `Contribution de 12 groupes d’aliments à l’apport quotidien en {{ nutrient }} ({{ amountUnit }}/j et pourcentage (%) de l'apport total)`,
                "yAxisTitle": `pourcentage (%) de l'apport total en {{nutrient}}`,
                "switchTypeButton": "Afficher les nombres"
            },
            "tableTitle": `Contribution de 12 groupes d’aliments à l’apport quotidien en {{ nutrient }} ({{ amountUnit }}/j et pourcentage (%) de l'apport total)`,   
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
                `{{ percentage }} %`
            ],
            "toolTip_percentageOnlyInterpretation": [
                "{{ interpretationValue }}"
            ],
            "toolTip_percentageWithInterpretation": [
                "{{ percentage }} % {{ interpretationValue }}"
            ],
            "tableSubHeadingFirstCol": "Groupe d'aliments",
            "tableSubHeadings": ["Moyenne ({{unit}})", "ET Moyenne", "Pourcentage de l'apport total (%)", "ET pourcentage (%)"],

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
                    `{{ percentage }} % de l'apport en {{nutrient}}`
                ],
                "toolTip_OnlyInterpretation": [
                    "{{ interpretationValue }}"
                ],
                "toolTip_WithInterpretation": [
                    `{{ percentage }} % {{ interpretationValue }} de l'apport en {{nutrient}}`
                ],
                "tableHeadings": ["Groupe d'aliments niveau 1", "Groupe d'aliments niveau 2", "Groupe d'aliments niveau 3", "Moyenne ({{unit}})", "ET Moyenne", "Pourcentage de l'apport total (%)", "ET pourcentage (%)"],
                "tableAllDataHeadings": ["Groupe âge-sexe", "Groupe d'aliments Niveau 1", "Groupe d'aliments niveau 2", "Groupe d'aliments niveau 3", "Moyenne ({{unit}})", "ET moyenne", "Pourcentage de l'apport total (%)", "ET pourcentage (%)"],

            "allDataCSVFileName": {
                "All Displayed": `Contribution des groupes et sous-groupes d’aliments à l'apport en {{nutrient}}`,
                "Filter Only Level 2": `Contribution des sous-groupes de niveau 2 à l'apport en {{nutrient}}`
            }
        },

        NotesAndLegend: {
            "NotesAndLegendDataSourceSubtitle": "Sources des données",
            "NotesAndLegendDataSourceDesc": "Statistique Canada, Enquête sur la santé dans les collectivités canadiennes 2015 - Nutrition, 2015, Fichier partagé.",
            "NotesAndLegendOpenDataSubTitle": "Tableau de contribution des sources d'alimentation sur les données ouvertes",
            "NotesAndLegendOpenDataDesc": `
                Les données pour d'autres groupes d'âge et de sexe se trouvent
                dans le
                <a
                href="https://ouvert.canada.ca/data/fr/dataset/b166b1c1-0313-4706-8cca-f464f6fc7086"
                target="_blank">tableau de contribution des sources alimentaires</a>
                disponible sur le portail de données ouvertes du gouvernement du Canada.`,
            "NotesAndLegendDataInterpretationSubtitle": "Notes d’interprétation",
            "NotesAndLegendDataInterpretationDesc": `
                Les aliments connus pour être de riches sources d'un nutriment peuvent ne pas contribuer de manière significative 
                aux apports de ce nutriment dans la population s'ils sont consommés en faibles quantités. En revanche, certains aliments 
                moins riches en nutriments peuvent contribuer de manière importante aux apports de la population simplement parce qu'ils sont 
                largement consommés et/ou consommés en grandes quantités.`,
            "NotesAndLegendDataAboutGraphSubtitle": "À propos des diagrammes et des tableaux",
            "NotesAndLegendDataAboutGraphDescHeadingRecipe": "Analyse des recettes:",
            "NotesAndLegendDataAboutGraphDescRecipe1": `
                Les groupes d'aliments de l'outil de contribution des sources alimentaires ont été générés en combinant les aliments consommés 
                en tant qu'aliment seul ou en tant qu'ingrédient. Par exemple, dans la catégorie des œufs, la contribution des œufs est basée sur 
                la consommation totale d'œufs durs (aliment) et d'œufs utilisés dans des recettes telles que les quiches, les gâteaux maison, etc. 
                La contribution de certains ingrédients tels que les œufs, le sucre, la farine, etc. peut être sous-estimée en raison de l'impossibilité 
                de décomposer certains aliments qui représentent des produits alimentaires commerciaux.`,
            "NotesAndLegendDataAboutGraphDescRecipe2": `
                Si vous êtes intéressé, un deuxième ensemble de données
                analysant les recettes dans leur ensemble ainsi que les
                aliments consommés seuls est également disponible sur le
                <a
                href="https://ouvert.canada.ca/data/fr/dataset/b166b1c1-0313-4706-8cca-f464f6fc7086"
                target="_blank">portail de données ouvertes du gouvernement du Canada</a>.`,
            "NotesAndLegendDataAboutGraphDescHeadingFood": "Groupes d'aliments:",
            "NotesAndLegendDataAboutGraphDescFood": `
                Les estimations ont été générées pour trois niveaux différents de regroupement d’aliments, basé sur la liste des groupes 
                d’aliments du Bureau des sciences de la nutrition (BSN), avec quelques modifications.`,
            "NotesAndLegendDataAboutGraphDescHeadingEstimate": "Estimations:",
            "NotesAndLegendDataAboutGraphDescEstimate1": `
                Toutes les estimations ont été obtenues à partir du premier
                rappel alimentaire de 24 heures. L'estimation 0,0% fait
                référence à des valeurs inférieures à 0,1%`,
            "NotesAndLegendDataAboutGraphDescEstimate2": `
                Pour plus d’informations, veuillez consulter le
                <a
                href="https://ouvert.canada.ca/data/fr/dataset/b166b1c1-0313-4706-8cca-f464f6fc7086/resource/e21437a5-4e40-4598-bd22-abc36e06114d"
                target="_blank">guide de l’utilisateur</a>
                du Tableau de contribution des sources alimentaires.`,
            "NotesAndLegendDataAboutCCHSSubtitle": "À propos de l'Enquête sur la santé dans les collectivités canadiennes - Nutrition (ESCC - Nutrition) de 2015",
            "NotesAndLegendDataAboutCCHSDesc1": `
                L'ESCC-Nutrition 2015 est une enquête nationale au sujet de la nutrition des personnes vivant au Canada . L'enquête fournit des informations détaillées sur 
                l’apport alimentaire en utilisant un rappel alimentaire de 24 heures effectué chez l’ensemble du groupe et d’un deuxième rappel effectué auprès d’un échantillon, 
                la consommation de suppléments nutritionnels, les mesures physiques, l’insécurité alimentaire des ménages ainsi que d’autres sujets permettant de mieux interpréter 
                les données des rappels de 24 heures.. L'enquête exclut les personnes vivant dans les trois territoires, les personnes vivant dans les réserves, la population vivant en 
                établissement, les membres à temps plein des Forces armées canadiennes et les résidents de certaines régions éloignées.`,
            "NotesAndLegendDataAboutCCHSDesc2": `
                Pour plus d’information sur l’Enquête sur la santé dans les collectivités canadiennes (ESCC) – Nutrition, 2015, veuillez consulter
                <a
                href="https://www.canada.ca/fr/sante-canada/services/aliments-nutrition/surveillance-aliments-nutrition/sondages-sante-nutrition/enquete-sante-collectivites-canadiennes-escc/guide-reference-comprendre-utiliser-donnees-2015.html"
                target="_blank">le guide de référence pour comprendre et utiliser les données</a>.`,
            "NotesAndLegendDataLegendSubtitle": "Légende",
            "NotesAndLegendDataLegendDesc1": `
                <dt class="mrgn-tp-sm">E:</dt>
                <dd>Données dont le coefficient de variation (CV) se situe entre 16,6% à 33,3%; interpréter avec prudence.</dd>

                <dt class="mrgn-tp-sm">F:</dt>
                <dd>Données dont le CV est supérieur à 33,3% supprimées en raison de l'extrême variabilité d'échantillonnage.</dd>

                <dt class="mrgn-tp-sm">X:</dt>
                <dd>groupe d’aliment avec moins de 10 mangeurs ; supprimé pour des raisons de confidentialité.</dd>

                <dt class="mrgn-tp-sm">J:</dt>
                <dd>Jour</dd>

                <dt class="mrgn-tp-sm">EFA:</dt>
                <dd>Équivalent de folate alimentaire</dd>

                <dt class="mrgn-tp-sm">g:</dt>
                <dd>Gramme</dd>

                <dt class="mrgn-tp-sm">kcal:</dt>
                <dd>Kilocalories</dd>

                <dt class="mrgn-tp-sm">mcg:</dt>
                <dd>Microgramme</dd>

                <dt class="mrgn-tp-sm">mg:</dt>
                <dd>Milligramme</dd>

                <dt class="mrgn-tp-sm">n:</dt>
                <dd>Taille de l'échantillon</dd>

                <dt class="mrgn-tp-sm">ET:</dt>
                <dd>Erreur type</dd>`,
            "NotesAndLegendDataLegendDesc2": "<i>* Exclut les femmes enceintes et allaitantes</i>",
            "NotesAndLegendDataCitationSubtitle": "Citation suggérée",
            "NotesAndLegendDataCitationDesc": `
                Santé Canada (2023). Tableau de contribution des sources
                alimentaires dérivé de l'Enquête sur la santé dans les
                collectivités canadiennes 2015 de Statistique Canada, Nutrition, fichier partagé, Ottawa.`,
            "NotesAndLegendDataCorrespondenceSubtitle": "Correspondance",
            "NotesAndLegendDataCorrespondenceDesc": "Bureau de l'intégration des données, de la science et des connaissances, Direction des aliments, Santé Canada, 251 Sir Frederick Banting Driveway, A.L. 2201E, Ottawa, ON K1A 0K9; Courriel : nutrition.surveillance-nutritionnelle@hc-sc.gc.ca"
        }
    }
}

// ==============================================================

// translations for certain text used in the project
export const TranslationObj = {
    en: LangEN,
    fr: LangFR
}