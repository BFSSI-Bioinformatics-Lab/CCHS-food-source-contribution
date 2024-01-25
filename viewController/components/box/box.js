import { SvgComponent } from "../component.js";
import { DefaultAttributes } from "../../../assets/strings/strings.js";
import { DefaultDims } from "../../../assets/dimensions/dimensions.js";
import { Colours } from "../../../assets/colours/colours.js";

// Box: Class for a box/rectangle
export class Box extends SvgComponent {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length,
                 boxWidth = DefaultDims.length,
                 boxHeight = DefaultDims.length,
                 padding = 0,
                 margin = 0,
                 id = null, 
                 opacity = DefaultAttributes.opacity,
                 backgroundColour = Colours.None,
                 boxColour = Colours.None} = {}) {
        super({parent: parent, x: x, y: y, width: width, height: height, padding: padding, margin: margin, id: id, opacity: opacity});

        this.backgroundColour = backgroundColour;
        this.boxColour = boxColour;
        this.boxWidth = boxWidth;
        this.boxHeight = boxHeight;

        // individual elements of the component
        this.backgroundBox = null;
        this.box = null;
    }

    // updateWidth(): Updates the width to fit all the elements
    updateWidth() {
        this.width = Math.max(this.width, this.paddingLeft + this.boxWidth + this.paddingRight);
    }

    // updateHeight(): Updates the height to fit all the elements
    updateHeight() {
        this.height = Math.max(this.height, this.paddingTop + this.boxHeight + this.paddingBottom);
    }

    setup() {
        super.setup();
        this.backgroundBox = this.group.append("rect");
        this.box = this.group.append("rect");
    }

    redraw(opts = {}) {
        this.updateWidth();
        this.updateHeight();

        super.redraw(opts);

        this.backgroundBox.attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", this.backgroundColour);

        this.box.attr("y", this.paddingTop)
            .attr("x", this.paddingLeft)
            .attr("width", this.boxWidth)
            .attr("height", this.boxHeight)
            .attr("fill", this.boxColour);
    }
}
