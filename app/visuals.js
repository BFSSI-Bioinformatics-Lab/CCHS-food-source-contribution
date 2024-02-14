/////////////////////////////////////////////////////////////////////////
//                                                                     //
// Purpose: Draws common visualizations used in both the bar graph and //
//      the sun burst graph                                            //
//                                                                     //
// What it Contains:                                                   //
//      - helper functions for visualizations                          //
//      - draws text, text boxes, info boxes, tool tips                //
//      - draws graph legends                                          //
//                                                                     //
//                                                                     //
/////////////////////////////////////////////////////////////////////////


import { Colours, DefaultDims, TextWrap, DefaultAttributes } from "../assets/assets.js";


// Visuals: a Helper class for any visual related functions
export class Visuals {
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


    // setupDims(dimName, values): Setups the padding and margin for the textbox
    static setupDims(dimName, values) {
        const result = {}
        const leftDimName = `${dimName}Left`;
        const topDimName = `${dimName}Top`;
        const rightDimName = `${dimName}Right`;
        const bottomDimName = `${dimName}Bottom`;

        const valueIsArray = (Array.isArray(values));

        // if 'values' is either a single number or an array with 1 item, then all directions have the same value
        if (typeof values === 'number' || (valueIsArray && values.length == 1)) {
            if (valueIsArray) {
                values = values[0];
            }

            result[leftDimName] = values;
            result[topDimName] = values;
            result[rightDimName] = values;
            result[bottomDimName] = values;
        
        // if 'values' is an array of length 2, first value is horizontal while second value is vertical
        } else if (valueIsArray && values.length == 2) {
            const horizontalValue = values[0];
            const verticalValue = values[1];

            result[leftDimName] = horizontalValue;
            result[topDimName] = verticalValue;
            result[rightDimName] = horizontalValue;
            result[bottomDimName] = verticalValue;
        
        // if 'values' is an array of that specified values for all directions
        } else if (valueIsArray && values.length >= 4) {
            result[leftDimName] = values[0];
            result[topDimName] = values[1];
            result[rightDimName] = values[2];
            result[bottomDimName] = values[3];
        
        // if 'values' is a dictionary of that specified values for all directions
        } else if (values.constructor == Object) {
            result[leftDimName] = values[leftDimName];
            result[topDimName] = values[topDimName];
            result[rightDimName] = values[rightDimName];
            result[bottomDimName] = values[bottomDimName];           
        }

        return result;
    }


    // getPadding(values): Retrieves the padding for all directions on a 2D plane
    static getPadding(values) {
        return this.setupDims("padding", values);
    }


    // getComponentLengths(width, height, padding): Retrieves the width/height of an element
    static getComponentLengths(width, height, padding) {
        height = Math.max(height, height - padding.paddingTop - padding.paddingBottom);
        width = Math.max(width, width - padding.paddingLeft - padding.paddingRight);

        return {width, height};
    }


    // getNextTextY(textY, numOfTextLines): Retrives the next y-position for the texts
    //  in a text box
    static getNextTextY(textY, numOfTextLines, fontSize, lineSpacing) {
        return textY +  (numOfTextLines + 1) * fontSize + numOfTextLines * lineSpacing
    }


    // drawGroup(parent, x, y): Draws a group in a SVG
    static drawGroup({parent = null, id = null, x = DefaultDims.pos, y = DefaultDims.pos, opacity = DefaultDims.opacity} = {}) {
        const group = parent.append("g")
            .attr("transform", `translate(${x}, ${y})`)
            .attr("opacity", opacity);

        if (id !== null) {
            group.attr("id", id);
        }

        return group;
    }


    // drawRectBackground(): Draws a rectangular backdrop in a SVG
    static drawRectBackground({parent = null, height = DefaultDims.length, width = DefaultDims.length, backgroundColour = Colours.None, 
                               borderColour = Colours.None, borderWidth = DefaultDims.length} = {}) {
        const rect = parent.append("rect")
            .attr("height", height)
            .attr("width", width)
            .attr("fill", backgroundColour)
            .attr("stroke", borderColour)
            .attr("stroke-width", borderWidth);

        return rect;
    }


    // drawWrappedText(text, numLines):
    //   Draws the text to be wrapped around the textbox by creating
    //      tspan elements to fit text into a given width
    static drawWrappedText({textGroup = null, text = "", width = DefaultDims.length, textX = DefaultDims.pos, textY = DefaultDims.pos, 
                            numLines = [0], fontSize = DefaultDims.fontSize, lineSpacing = DefaultDims.lineSpacing, clear = true} = {}) {
        const words = text.split(" ");
        const tspanXPos = textX;
        let currentTextY = textY;
        
        // remove any existing text
        if (clear) {
            textGroup.selectAll("tspan").remove();
        }
        
        // draws the remainder of the text on a new line if the text exceeds the specified width
        words.reduce((arr, word) => {
            let textNode = arr[arr.length - 1];
            let line = textNode.text().split(" ");
            line.push(word);
            textNode.text(line.join(" "));
            if (textNode.node().getComputedTextLength() > width) {
                line.pop();
                currentTextY = this.getNextTextY(textY, arr.length, fontSize, lineSpacing);

                textNode.text(line.join(" "));
                textNode = textGroup.append("tspan")
                    .attr("x", tspanXPos)
                    .attr("y", currentTextY)
                    .text(word);
                arr.push(textNode);
                numLines[0]++;
                numLines.push(textNode.text().length)
            } else {
                textNode.text(line.join(" "));
                arr[arr.length - 1] = textNode;
            }
            return arr;
        }, [textGroup.append("tspan").attr("x", tspanXPos).attr("y", textY + fontSize)]);
        numLines[0]++; 
        numLines.push(words.pop().length);
    }


    // drawSingleLineText(text, TextY): Draws the text on a single line in the textbox
    static drawSingleLineText({textGroup = null, text = "", textX = DefaultDims.pos, textY = DefaultDims.pos, clear = true} = {}) {
        // remove any existing text
        if (clear) {
            textGroup.selectAll("tspan").remove();
        }

        const textNode = textGroup.append("tspan")
            .attr("x", textX).attr("y", textY)
            .text(text);

        return textNode;
    }


    // drawText(): Draws text on 'textGroup'
    static drawText({textGroup = null, text = "", textX = DefaultDims.pos, textY = DefaultDims.pos, width = DefaultDims.length, 
                     fontSize = DefaultDims.fontSize, lineSpacing = DefaultDims.lineSpacing, textWrap = DefaultAttributes.textWrap, padding = 0} = {}) {
        
        padding = this.getPadding(padding);
        const origTextY = textY;
        let textLines = text;
        let linesWritten = 0;
        let clear = true;
        let line = "";

        if (typeof textLines === 'string') {
            textLines = [textLines];
        }

        const textLinesLen = textLines.length;

        // draws many lines of wrapped text that are each seperated by a newline
        if (textWrap == TextWrap.Wrap) {
            let numLines = [];

            for (let i = 0; i < textLinesLen; ++i) {
                line = textLines[i];
                numLines = [];

                if (i > 0) {
                    clear = false;
                }

                this.drawWrappedText({textGroup, text: line, width, textX, textY, numLines, fontSize, lineSpacing, clear});
                linesWritten += numLines.length;
                textY = this.getNextTextY(origTextY, linesWritten, fontSize, lineSpacing);
            }

        // draws all text on a single line with each text seperated by a newline
        } else if (textWrap == TextWrap.NoWrap) {
            textY += fontSize;

            for (let i = 0; i < textLinesLen; ++i) {
                line = textLines[i];

                if (i > 0) {
                    clear = false;
                }

                let textNode = this.drawSingleLineText({textGroup, text: line, textX, textY, clear});
                width = Math.max(padding.paddingLeft + textNode.node().getComputedTextLength() + padding.paddingRight, width);

                linesWritten += 1;
                textY = this.getNextTextY(origTextY, linesWritten, fontSize, lineSpacing);
            }
        }

        return {width, textBottomYPos: textY};
    }


    // drawInfoBox(): Draws the info box without any text
    static drawInfoBoxContainer({parent = null, x = DefaultDims.pos, y = DefaultDims.pos, height = DefaultDims.length, borderColour = Colours.None, borderWidth = DefaultDims.borderWidth,
                                 fontSize = DefaultDims.fontSize, textX = DefaultDims.pos, textY = DefaultDims.pos} = {}) {

        const group = this.drawGroup({parent, x, y});

        // border line for the info box
        const highlight = group.append("line")
            .attr("x1", borderWidth / 2)
            .attr("x2", borderWidth / 2)
            .attr("y2", height)
            .attr("stroke-width", borderWidth)
            .attr("visibility", "visible")
            .attr("stroke", borderColour);

        if (borderColour !== null) {
            highlight.attr("visibility", "visible")
                .attr("stroke", borderColour);
        }

        // container to hold the text
        const textGroup = group.append("text").attr("font-size", fontSize)
            .attr("transform", `translate(${borderWidth + textX}, ${textY})`);

        return {group, highlight, textGroup};
    }


    // drawInfoBox(): Draw the info box
    static drawInfoBox({parent = null, x = DefaultDims.pos, y = DefaultDims.pos, height = DefaultDims.length, width = DefaultDims.length,  text = "", 
                        borderColour = Colours.None, borderWidth = DefaultDims.borderWidth, padding = 0, textWrap = DefaultAttributes.textWrap, lineSpacing = DefaultDims.lineSpacing,
                        fontSize = DefaultDims.fontSize} = {}) {

        padding = this.getPadding(padding);
        let dims = this.getComponentLengths(width, height, padding);
        const textX = padding.paddingLeft;
        const textY = padding.paddingRight;

        const infoBox = this.drawInfoBoxContainer({parent, x, y, height, borderColour, borderWidth, textX, textY, fontSize});
        
        // draw the text
        const textDims = this.drawText({textGroup: infoBox.textGroup, text, width, fontSize, lineSpacing, textWrap, padding})

        // update the height of the info box to be larger than the height of the text
        height = Math.max(dims.height, textDims.textBottomYPos + padding.paddingBottom);
        infoBox.highlight.attr("y2", height);

        return infoBox;
    }


    // updateInfoBox(): Updates the infobox
    static updateInfoBox({infoBox = null, colour = Colours.None, text = "", width = DefaultDims.length, fontSize = DefaultDims.fontSize, 
                          lineSpacing = DefaultDims.lineSpacing, padding = 0} = {}) {
        
        padding = this.getPadding(padding);

        // change text
        const textDims = this.drawText({textGroup: infoBox.textGroup, text, width, fontSize, lineSpacing, padding});

        // change colour
        infoBox.highlight.attr("stroke", colour);

        // update the height of the info box to be larger than the height of the text
        let height = infoBox.highlight.node().getBBox()["height"];
        height = Math.max(height, padding.paddingTop + textDims.textBottomYPos + padding.paddingBottom);
        infoBox.highlight.attr("y2", height);
    }


    // drawToolTipContainer(): Draws the tooltip without any text
    static drawToolTipContainer({parent = null, id = null, x = DefaultDims.pos, y = DefaultDims.pos, height = DefaultDims.length, width = DefaultDims.length, backgroundColour = Colours.None,
                                 borderColour = Colours.None, borderWidth = DefaultDims.borderWidth, textX = DefaultDims.pos, textY = DefaultDims.pos, fontSize = DefaultDims.fontSize, opacity = DefaultDims.opacity} = {}) {
        const group = this.drawGroup({parent, id, x, y, opacity});
        const background = this.drawRectBackground({parent: group, height, width, backgroundColour, borderColour, borderWidth})

        const textGroup = group.append("text")
            .attr("font-size", fontSize)
            .attr("transform", `translate(${borderWidth + textX}, ${textY})`);

        return {group, background, textGroup};
    }


    // drawToolTip(): Draws the tooltip
    static drawToolTip({parent = null, id = null, x = DefaultDims.pos, y = DefaultDims.pos, height = DefaultDims.length, width = DefaultDims.length, text = "", padding = 0,
                        backgroundColour = Colours.None, borderColour = Colours.None, borderWidth = DefaultDims.borderWidth, textWrap = DefaultAttributes.textWrap,
                        fontSize = DefaultDims.fontSize, lineSpacing = DefaultDims.lineSpacing, opacity = DefaultDims.opacity} = {}) {
        
        padding = this.getPadding(padding);
        let dims = this.getComponentLengths(width, height, padding);
        const textX = padding.paddingLeft;
        const textY = padding.paddingRight;
            
        // draw the container for the tooltip
        const toolTip = this.drawToolTipContainer({parent, id, x, y, height: dims.height, width: dims.width, backgroundColour, borderColour, borderWidth, textX, textY, opacity});

        // draw the text
        const textDims = this.drawText({textGroup: toolTip.textGroup, text, width: dims.width, fontSize, lineSpacing, textWrap, padding});

        // update the height of the tooltip to be larger than the height of all the text
        height = Math.max(height, padding.paddingTop + textDims.textBottomYPos + padding.paddingBottom);
        toolTip.background.attr("height", height);

        // update the width of the tooltip to be larger than the width of all the text
        width = Math.max(width, padding.paddingLeft + textDims.width + padding.paddingRight);
        toolTip.background.attr("width", width);

        return toolTip;
    }


    // drawLegendItemItem(): Draws a single key for the legend
    static drawLegendItem({parent = null, x = DefaultDims.pos, y = DefaultDims.pos, text = "", padding = 0, boxWidth = DefaultDims.length, 
                           boxHeight = DefaultDims.length, textPadding = 0, fontSize = DefaultDims.fontSize, boxColour = Colours.None} = {}) {
        padding = this.getPadding(padding);
        textPadding = this.getPadding(textPadding);

        const group = this.drawGroup({parent, x, y});

        // draw the coloured box
        const colourBox = group.append("rect")
            .attr("y", padding.paddingTop)
            .attr("x", padding.paddingLeft)
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("fill", boxColour);

        // draw the text
        const textX = padding.paddingLeft + boxWidth + textPadding.paddingLeft;
        const textY = textPadding.paddingTop;
        const textGroup = group.append("text")
            .attr("y", padding.paddingTop)
            .attr("x", textX)
            .attr("font-size", fontSize);

        this.drawText({textGroup, fontSize, textWrap: TextWrap.NoWrap, text, textX, textY});
        return {group, colourBox, textGroup, name: text, colour: boxColour};
    }


    // drawLegend(): draws a legend for a graph
    // Note: assume 'data' is a list of tuples where each element is:
    //          [name, colour]
    static drawLegend({parent = null, x = DefaultDims.pos, y = DefaultDims.pos, data =  [], legendItemPadding = 0, 
                       textPadding = 0, colourBoxWidth = DefaultDims.length, colourBoxHeight = DefaultDims.length, fontSize = DefaultDims.fontSize} = {}) {

        const group = this.drawGroup({parent, x, y});
        legendItemPadding = this.getPadding(legendItemPadding);
        const legendItems = [];
        let currentLegendItemYPos = 0;

        // draw all the keys for the legend
        for (const legendKey of data) {
            let text = legendKey[0];
            let colour = legendKey[1];

            const legendItem = this.drawLegendItem({parent: group, text, x: 0, y: currentLegendItemYPos, padding: legendItemPadding, boxWidth: colourBoxWidth, 
                                                    boxHeight: colourBoxHeight, textPadding, fontSize, boxColour: colour});

            currentLegendItemYPos += legendItemPadding.paddingTop + legendItemPadding.paddingBottom + legendItem.group.node().getBBox()["height"];
            legendItems.push(legendItem);
        }

        return {group, legendItems}
    }
};