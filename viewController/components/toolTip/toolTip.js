import { DefaultDims } from "../../../assets/dimensions/dimensions.js";
import { Colours } from "../../../assets/colours/colours.js";
import { TextWrap, DefaultAttributes } from "../../../assets/strings/strings.js";
import { TextBox } from "../textbox/textBox.js";

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
                 borderColour = Colours.None, 
                 textWrap = TextWrap.Wrap, 
                 opacity = DefaultAttributes.opacity, 
                 backgroundColour = Colours.None} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, text: text, fontSize: fontSize, 
               padding: padding, margin: margin, lineSpacing: lineSpacing, 
               textAlign: textAlign, fontWeight: fontWeight, 
               textWrap: textWrap, backgroundColour: backgroundColour, id: id, opacity: opacity});
        this.borderWidth = borderWidth;
        this.borderColour = borderColour;

        // different individual parts of the component
        this.cardRect = null;
    }

    setup() {
        super.setup();
        this.cardRect = this.group.append("rect");
    }

    redraw(opts = {}) {
        super.redraw(opts);
        this.box.attr("stroke", this.borderColour)
            .attr("stroke-width", this.borderWidth);
    }
}