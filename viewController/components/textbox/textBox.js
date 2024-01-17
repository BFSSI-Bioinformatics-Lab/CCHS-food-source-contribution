import { svgComponent } from "../svgComponent.js";
import { DefaultDims } from "../../../assets/dimensions/defaultDimensions.js";
import { TextWrap } from "../../../assets/strings/attributes.js";
import { DefaultAttributes } from "../../../assets/strings/defaultAttributes.js";
import { Colours } from "../../../assets/colours/colours.js";

export class TextBox extends svgComponent {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length, 
                 text = "", 
                 fontSize = DefaultDims.fontSize, 
                 padding = 0, 
                 margin = 0, 
                 lineSpacing = DefaultDims.lineSpacing, 
                 textAlign = DefaultAttributes.textAnchor, 
                 fontWeight = DefaultAttributes.fontWeight, 
                 textWrap = DefaultAttributes.textWrap, 
                 fill = Colours.None, id = null, 
                 opacity = DefaultAttributes.opacity} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, id: id, opacity: opacity});
        this.fontSize = fontSize;
        this.lineSpacing = lineSpacing;
        this.textAlign = textAlign;
        this.fontWeight = fontWeight;
        this.textWrap = textWrap;
        this.fill = fill;

        // text can either be a string or a list of strings
        this.text = text;

        // setup the padding and margins
        this.setupDims("padding", padding);
        this.setupDims("margin", margin);
        this.textX = this.paddingLeft;
        this.textY = this.paddingTop;

        // different individual parts of the component drawn
        this.box = null;
        this.textGroup = null;
    }

    setup() {
        super.setup();
        this.box = this.group.append("rect");
        this.textGroup = this.group.append("text");
    }

    redraw(opts = {}) {
        super.redraw(opts);
        this.textGroup.attr("font-size", this.fontSize);
        this.textGroup.attr("text-anchor", this.textAlign);
        this.textGroup.attr("font-weight", this.fontWeight);

        this.box.attr("height", this.height)
            .attr("width", this.width)
            .attr("fill", this.fill)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 0)
            .attr("stroke", Colours.None)
            .attr("x", 0)
            .attr("y", 0);

        // whether to do extra computation for redrawing the text
        if (opts["redrawText"] === undefined || opts["redrawText"]) {
            this.redrawText();
        }
    }

    remove(opts = {}) {
        if (opts["redrawText"] === undefined || opts["redrawText"]) {
            this.textGroup.selectAll("tspan").remove();
        }
    }

    redrawText() {
        let textY = this.textY;
        let prevTextY = textY;
        let textLines = this.text;
        let linesWritten = 0;
        if (typeof textLines === 'string') {
            textLines = [textLines];
        }

        if (this.textWrap == TextWrap.Wrap) {
            let numLines = [];
            let width = this.getTextAvailableWidth();

            for (const line of textLines) {
                numLines = [];
                this.drawWrappedText(line, width, textY, numLines);
                linesWritten += numLines.length;

                prevTextY = textY;
                textY = this.getNextTextY(this.textY, linesWritten);
            }
        } else if (this.textWrap == TextWrap.NoWrap) {
            textY += this.fontSize;
            prevTextY = textY;

            for (const line of textLines) {
                this.drawText(line, textY);
                linesWritten += 1;

                prevTextY = textY;
                textY = this.getNextTextY(this.textY, linesWritten);
            }
        }

        this.height = Math.max(this.height, prevTextY + this.fontSize / 2 + this.paddingBottom);
    }

    // getTspanXPos(): Retrieves the x-coordinate position for the tspan text
    getTSpanXPos() {
        return this.textX;
    }

    // getTextAvailableWidth(): Retrieves the text width available for the textbox
    getTextAvailableWidth() {
        return this.width - this.paddingLeft - this.paddingRight;
    }

    // getNextTextY(textY, numOfTextLines): Retrives the next y-position for the texts
    getNextTextY(textY, numOfTextLines) {
        return textY +  (numOfTextLines + 1) * this.fontSize + numOfTextLines * this.lineSpacing
    }

    // drawWrappedText(text, numLines):
    //   Draws the text to be wrapped around the textbox by creating
    //      tspan elements to fit text into a given width
    drawWrappedText(text, width, textY, numLines = [0]) {
        const words = text ? text.split(" ") : this.textGroup.text().split(" ");
        const tspanXPos = this.getTSpanXPos();
        let currentTextY = textY;

        words.reduce((arr, word) => {
            let textNode = arr[arr.length - 1];
            let line = textNode.text().split(" ");
            line.push(word);
            textNode.text(line.join(" "));
            if (textNode.node().getComputedTextLength() > width) {
                line.pop();
                currentTextY = this.getNextTextY(textY, arr.length);

                textNode.text(line.join(" "));
                textNode = this.textGroup.append("tspan")
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
        }, [this.textGroup.append("tspan").attr("x", tspanXPos).attr("y", textY + this.fontSize)]);  
        numLines[0]++; 
        numLines.push(words.pop().length);
    }

    // drawText(text, TextY): Draws the text on a single line in the textbox
    drawText(text, textY) {
        const tspanXPos = this.getTSpanXPos();
        const textNode = this.textGroup.append("tspan")
            .attr("x", tspanXPos).attr("y", textY)
            .text(text);

        this.width = Math.max(textNode.node().getComputedTextLength() + 20, this.width);
    }
}