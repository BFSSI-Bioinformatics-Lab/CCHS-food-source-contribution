// =================================================
// == Colours                                     ==
// =================================================

// Colours: Some commonly used colours
export const Colours = {
    None: "none"
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
    upperGraphLeft: 60,
    upperGraphRight: 400,
    upperGraphTop: 60,
    upperGraphBottom: 60,
    upperGraphTooltipMinWidth: 140,
    upperGraphTooltipFontSize: 12,
    upperGraphTooltipTopPadding: 8,
    upperGraphTooltipLeftPadding: 10,
    upperGraphTooltipLineSpacing: 3,
    upperGraphInfoBoxWidth: 240,
    upperGraphInfoBoxHeight: 200,
    upperGraphInfoBoxFontSize: 14,
    upperGraphInfoBoxBorderWidth: 10,
    upperGraphInfoBoxPaddingLeft: 10,
    upperGraphInfoBoxLineSpacing: 5,
    upperGraphInfoBoxLeftMargin: 30,
    upperGraphChartHeadingFontSize: 20,
    lowerGraphWidth: 700,
    lowerGraphHeight: 700,
    lowerGraphLeft: 60,
    lowerGraphRight: 400,
    lowerGraphTop: 60,
    lowerGraphBottom: 60,
    lowerGraphArcRadius: 65,
    lowerGraphCenterArcRadius: 45,
    lowerGraphCenterArcInnerRadius: 18,
    lowerGraphCenterArcMargin: 1,
    lowerGraphCenterFontSize: 20,
    lowerGraphTooltipMinWidth: 140,
    lowerGraphTooltipFontSize: 12,
    lowerGraphInfoBoxWidth: 240,
    lowerGraphInfoBoxHeight: 200,
    lowerGraphArcLabelFontSize: 12,
    lowerGraphArcPadding: 5,
    lowerGraphChartHeadingFontSize: 20,    
    lowerGraphInfoBoxFontSize: 14, 
    lowerGraphInfoBoxBorderWidth: 10,
    lowerGraphInfoBoxPaddingLeft: 10,
    lowerGraphInfoBoxLineSpacing: 10,
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

// default attributes used for different components
export const DefaultAttributes = {
    textAnchor: TextAnchor.Start,
    textWrap: TextWrap.Wrap,
    fontWeight: FontWeight.Normal,
    opacity: 1
}

// column names in the food description group csv file
export const FoodGroupDescDataColNames = {
    foodGroupLv1: "Food Group Name_Level 1",
    foodGroupLv2: "Food Group Name_Level 2",
    foodGroupLv3: "Food Group Name_Level 3",
    description: "Description of the Contents of the Food Groups and Sub-groups"
};

// column names in the food ingredient csv file
export const NutrientDataColNames = {
    ageSexGroup: "Age-sex group (*: excludes pregnant or breastfeeding)",
    foodGroupLv1: "Food group_level1",
    foodGroupLv2: "Food group_level2",
    foodGroupLv3: "Food group_level3"
};

// heading names for the age sex group
export const AgeSexGroupHeadings = {
    Population1Up: "Population age 1+", 
    Children1To8: "Children 1 to 8 y", 
    YouthAndAdolescents: "Youth & adolescents 9 to 18 y",
    AdultMales: "Adult males 19 y +",
    AdultFemales: "Adult females* 19 y +"
};


// Different display states of the sun burst graph
export const SunBurstStates = {
    AllDisplayed: "All Displayed",
    FilterOnlyLevel2: "Filter Only Level 2"
};


// Ordering for the headings of the age-sex groups
export const AgeSexGroupOrder = {};
AgeSexGroupOrder[AgeSexGroupHeadings.Population1Up] = 0;
AgeSexGroupOrder[AgeSexGroupHeadings.Children1To8] = 1;
AgeSexGroupOrder[AgeSexGroupHeadings.YouthAndAdolescents] = 2;
AgeSexGroupOrder[AgeSexGroupHeadings.AdultMales] = 3;
AgeSexGroupOrder[AgeSexGroupHeadings.AdultFemales] = 4;