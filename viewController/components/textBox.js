import { RectSvgComponent } from "./component.js";
import { Colours, DefaultDims, TextWrap, DefaultAttributes } from "../../assets/assets.js";

export class TextBox extends RectSvgComponent {
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
                 backgroundColour = Colours.None,
                 borderColour = Colours.None,
                 borderWidth = 0,
                 id = null, 
                 opacity = DefaultAttributes.opacity} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, id: id, opacity: opacity, padding: padding, margin: margin, backgroundColour, borderColour, borderWidth});
        this.fontSize = fontSize;
        this.lineSpacing = lineSpacing;
        this.textAlign = textAlign;
        this.fontWeight = fontWeight;
        this.textWrap = textWrap;

        // text can either be a string or a list of strings
        this._text = text;
        this.textX = this.paddingLeft + this.marginLeft;
        this.textY = this.paddingTop + this.marginTop;

        // whether the text changes
        this._textChanged = true;

        // different individual parts of the component drawn
        this.textGroup = null;
    }

    // text(): Getter for 'text'
    get text() {
        return this._text;
    }

    // text(newText): Setter for 'text'
    set text(newText) {
        this._text = newText;
        this._textChanged = true;
    }

    setup(opts = {}) {
        super.setup(opts);
        this.textGroup = this.group.append("text");
    }

    redraw(opts = {}) {
        super.redraw(opts);
        this.textGroup.attr("font-size", this.fontSize);
        this.textGroup.attr("text-anchor", this.textAlign);
        this.textGroup.attr("font-weight", this.fontWeight);

        // whether to do extra computation for redrawing the text
        if (this._textChanged) {
            this.redrawText();
        }
    }

    clear(opts = {}) {
        if (this._textChanged) {
            this.textGroup.selectAll("tspan").remove();
        }
    }

    update({atts = {}, opts = {}} = {}) {
        super.update({atts: atts, opts: opts});
        this._textChanged = false;
    }

    redrawText() {
        let textY = this.textY;
        let prevTextY = textY;
        let textLines = this._text;
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

        this.width = Math.max(textNode.node().getComputedTextLength() + this.paddingLeft + this.paddingRight, this.width);
    }
}


// ToolTip: A component for the tooltip
export class ToolTip extends TextBox {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length, 
                 id = null, 
                 text = "",
                 fontSize = DefaultDims.fontSize, 
                 borderWidth = DefaultDims.borderWidth, 
                 padding = 0, 
                 margin = 0, 
                 lineSpacing = DefaultDims.lineSpacing, 
                 textAlign = DefaultAttributes.textAnchor, 
                 fontWeight = DefaultAttributes.fontWeight, 
                 backgroundColour = Colours.None,
                 borderColour = Colours.None,
                 textWrap = TextWrap.Wrap, 
                 opacity = DefaultAttributes.opacity} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, text: text, fontSize: fontSize, 
               padding: padding, margin: margin, lineSpacing: lineSpacing, 
               textAlign: textAlign, fontWeight: fontWeight, 
               textWrap: textWrap, backgroundColour: backgroundColour, id: id, opacity: opacity, borderColour, borderWidth});
    }
}


// Infobox: A component for drawing the infobox
export class Infobox extends TextBox {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length, 
                 text = "",
                 fontSize = DefaultDims.fontSize, 
                 borderWidth = DefaultDims.borderWidth, 
                 padding = 0, 
                 margin = 0,
                 lineSpacing = DefaultDims.lineSpacing, 
                 textAlign = DefaultAttributes.textAnchor, 
                 fontWeight = DefaultAttributes.fontWeight, 
                 backgroundColour = Colours.None,
                 borderColour = Colours.None,
                 textWrap = DefaultAttributes.textWrap, 
                 id = null, 
                 opacity = DefaultAttributes.opacity,
                 onMouseEnter = null,
                 onMouseClick = null,
                 onMouseLeave = null,
                 onMouseOver = null,
                 onMouseMove = null} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, text: text, fontSize: fontSize, 
               padding: padding, margin: margin, lineSpacing: lineSpacing, textAlign: textAlign, fontWeight: fontWeight, 
               textWrap: textWrap, id: id, opacity: opacity, backgroundColour, borderWidth, onMouseEnter, onMouseClick, onMouseLeave, onMouseOver, onMouseMove});
        this.borderColour = borderColour;
        this.textX = this.borderWidth + this.paddingLeft;
        
        // different individual parts of the component drawn
        this.highlight = null;
    }

    // getTextAvailableWidth(): Retrieves the text width available for the textbox
    getTextAvailableWidth() {
        return this.width - this.paddingLeft - this.paddingRight - this.borderWidth;
    }

    setup(opts = {}) {
        super.setup(opts);
        this.highlight = this.group.append("line");
    }

    redrawBackground() {
        this.background.attr("height", this.height)
            .attr("width", this.width)
            .attr("fill", this._backgroundColour);
    }

    redraw(opts = {}) {
        super.redraw(opts);
        this.highlight.attr("x1", this.borderWidth / 2)
            .attr("x2", this.borderWidth / 2)
            .attr("y2", this.height)
            .attr("stroke-width", this.borderWidth);

        if (this.borderColour !== null) {
            this.highlight
                .attr("visibility", "visible")
                .attr("stroke", this.borderColour);
        }
    }
}