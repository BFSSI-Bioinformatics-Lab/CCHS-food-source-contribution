export const translationObj = {
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
                /* If the context number is not between 1-3 */
                "hoverBoxLevel_other": [ 
                    "{{ name }}",
                    "{{ percentage }}% of total {{ nutrient }} intake."
                ],
            }
        }
    },
    fr: { 
        translation: {} 
    }
}