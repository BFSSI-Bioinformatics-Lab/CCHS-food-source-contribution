import { svgComponent } from "../svgComponent.js";
import { DefaultDims } from "../../../assets/dimensions/defaultDimensions.js";

export class Infobox extends svgComponent{
    constructor(parent, x = DefaultDims.pos, y = DefaultDims.pos, width = DefaultDims.length, height = DefaultDims.length, 
                fontSize = DefaultDims.fontSize, borderWidth = DefaultDims.borderWidth, paddingLeft = DefaultDims.paddingSize,
                lineSpacing = DefaultDims.lineSpacing, textX = DefaultDims.paddingSize, textY = DefaultDims.paddingSize) {
        super(parent, x, y, width, height);
        this.fontSize = fontSize;
        this.borderWidth = borderWidth;
        this.lineSpacing = lineSpacing;
        this.paddingLeft = paddingLeft;
        this.textX = textX;
        this.textY = textY;
        
        // different individual parts of the component drawn
        this.highlight = null;
        this.text = null;
    }

    draw() {
        super.draw();
        this.highlight = this.group.append("line")
                        .attr("visibility", "hidden")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", 0)
                        .attr("y2", this.height)
                        .attr("stroke-width", this.borderWidth);

        this.text = this.group.append("text")
                        .attr("font-size", this.fontSize);
    }


    // getTspanXPos(): Retrieves the x-coordinate position for the tspan text
    getTSpanXPos() {
        return this.textX + (this.width - this.borderWidth) / 2 + this.paddingLeft;
    }

    // drawText(text, numLines):
    //   Draws the text to be wrapped around the textbox by creating
    //      tspan elements to fit text into a given width
    drawText(text, numLines = [0]) {
        let width = this.width - this.borderWidth;
        const words = text ? text.split(" ") : this.text.text().split(" ");
        const tspanXPos = this.getTSpanXPos();

        words.reduce((arr, word) => {
            let textNode = arr[arr.length - 1];
            let line = textNode.text().split(" ");
            line.push(word);
            textNode.text(line.join(" "));
            if (textNode.node().getComputedTextLength() > width) {
                line.pop();
                textNode.text(line.join(" "));
                textNode = this.text.append("tspan")
                    .attr("x", tspanXPos)
                    .attr("y", this.textY + (arr.length + 1) * this.fontSize + arr.length * this.lineSpacing)
                    .text(word);
                arr.push(textNode);
                numLines[0]++;
                numLines.push(textNode.text().length)
            } else {
                textNode.text(line.join(" "));
                arr[arr.length - 1] = textNode;
            }
            return arr;
        }, [this.text.append("tspan").attr("x", tspanXPos).attr("y", this.textY + this.fontSize)]);  
        numLines[0]++; 
        numLines.push(words.pop().length);
    }

    // updateText(newText, newColour): Updates the text within the textboxs
    updateText(newText, newColour = null) {
        if (newColour !== null) {
            this.highlight
                .attr("visibility", "visible")
                .attr("stroke", newColour);
        }

        this.text.selectAll("tspan").remove();

        let numLines = [];
        this.drawText(newText, numLines);
    }
}