import { AgeSexGroupHeadings } from "../../assets/strings/strings.js";

// Ordering for the headings of the age-sex groups
export const AgeSexGroupOrder = {};
AgeSexGroupOrder[AgeSexGroupHeadings.Population1Up] = 0;
AgeSexGroupOrder[AgeSexGroupHeadings.Children1To8] = 1;
AgeSexGroupOrder[AgeSexGroupHeadings.YouthAndAdolescents] = 2;
AgeSexGroupOrder[AgeSexGroupHeadings.AdultMales] = 3;
AgeSexGroupOrder[AgeSexGroupHeadings.AdultFemales] = 4;

// Different display states of the sun burst graph
export const SunBurstStates = {
    AllDisplayed: "All Displayed",
    FilterOnlyLevel2: "Filter Only Level 2"
};