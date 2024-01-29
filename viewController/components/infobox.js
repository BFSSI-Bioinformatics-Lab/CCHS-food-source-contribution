import { TextBox } from "./textBox.js";
import { Colours, DefaultDims, DefaultAttributes } from "../../assets/assets.js";


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
                 borderColour = Colours.None, 
                 textWrap = DefaultAttributes.textWrap, 
                 id = null, 
                 opacity = DefaultAttributes.opacity} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, text: text, fontSize: fontSize, 
               padding: padding, margin: margin, lineSpacing: lineSpacing, textAlign: textAlign, fontWeight: fontWeight, 
               textWrap: textWrap, id: id, opacity: opacity});
        this.borderWidth = borderWidth;
        this.borderColour = borderColour;
        this.textX = this.borderWidth + this.paddingLeft;
        
        // different individual parts of the component drawn
        this.highlight = null;
    }

    // getTextAvailableWidth(): Retrieves the text width available for the textbox
    getTextAvailableWidth() {
        return this.width - this.paddingLeft - this.paddingRight - this.borderWidth;
    }

    setup() {
        super.setup();
        this.highlight = this.group.append("line");
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