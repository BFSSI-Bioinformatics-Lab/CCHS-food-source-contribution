/////////////////////////////////////////////////////////////////////////
//                                                                     //
// Purpose: Helper functions for visualizations                        //
//                                                                     //
// What it Contains:                                                   //
//      - helper functions for visualizations                          //
//                                                                     //
/////////////////////////////////////////////////////////////////////////


import { DefaultDims, TextWrap, DefaultAttributes } from "./assets.js";


// temporary canvas used for measuring width of text
const WidthCanvas = document.createElement("canvas");


/* Returns selected option given a select html tag selector or element */
export function getSelector(element) {
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
// References: Getting Text Width: http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
//             Getting Letter Spacing: https://stackoverflow.com/questions/8952909/letter-spacing-in-canvas-element
export function getTextWidth(text, fontSize, fontFamily, letterSpacing = 0) {
    // if given, use cached scanvas for better performance
    // else, create new canvas
    var context = WidthCanvas.getContext("2d");
    context.font = fontSize + 'px ' + fontFamily;

    // add whitespaces between the letters for letterSpacing
    for (let i = 0; i < letterSpacing; ++i) {
        text = text.split("").join(String.fromCharCode(8201))
    }

    return context.measureText(text).width;
};

// getNextTextY(textY, numOfTextLines): Retrives the next y-position for the texts
//  in a text box
function getNextTextY(textY, numOfTextLines, fontSize, lineSpacing) {
    return textY +  (numOfTextLines + 1) * fontSize + numOfTextLines * lineSpacing
}

// drawWrappedText(text, numLines):
//   Draws the text to be wrapped around the textbox by creating
//      tspan elements to fit text into a given width
export function drawWrappedText({textGroup = null, text = "", width = DefaultDims.length, textX = DefaultDims.pos, textY = DefaultDims.pos, 
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
            currentTextY = getNextTextY(textY, arr.length, fontSize, lineSpacing);

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
export function drawSingleLineText({textGroup = null, text = "", textX = DefaultDims.pos, textY = DefaultDims.pos, clear = true} = {}) {
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
export function drawText({textGroup = null, text = "", textX = DefaultDims.pos, textY = DefaultDims.pos, width = DefaultDims.length, 
                          fontSize = DefaultDims.fontSize, lineSpacing = DefaultDims.lineSpacing, textWrap = DefaultAttributes.textWrap, paddingLeft = 0, paddingRight = 0} = {}) {

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

            drawWrappedText({textGroup, text: line, width, textX, textY, numLines, fontSize, lineSpacing, clear});
            linesWritten += numLines.length;
            textY = getNextTextY(origTextY, linesWritten, fontSize, lineSpacing);
        }

        textY -= fontSize;

    // draws many lines of text on a single line with each text seperated by a newline
    } else if (textWrap == TextWrap.NoWrap) {
        textY += fontSize;

        for (let i = 0; i < textLinesLen; ++i) {
            line = textLines[i];

            if (i > 0) {
                clear = false;
            }

            let textNode = drawSingleLineText({textGroup, text: line, textX, textY, clear});
            width = Math.max(paddingLeft + textNode.node().getComputedTextLength() + paddingRight, width);

            linesWritten += 1;
            textY = getNextTextY(origTextY, linesWritten, fontSize, lineSpacing);
        }
    }

    return {width, textBottomYPos: textY - lineSpacing - fontSize};
}
