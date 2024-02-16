/////////////////////////////////////////////////////////////////////////
//                                                                     //
// Purpose: Helper functions for visualizations                        //
//                                                                     //
// What it Contains:                                                   //
//      - helper functions for visualizations                          //
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
    // Note: 'text' is either a string or a list of strings
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

        // draws may lines of text on a single line with each text seperated by a newline
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
};