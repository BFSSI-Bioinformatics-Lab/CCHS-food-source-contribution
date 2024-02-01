import { RectSvgComponent } from "./component.js";
import { Colours, DefaultDims, DefaultAttributes } from "../../assets/assets.js";


// Box: Class for a box/rectangle
export class Box extends RectSvgComponent {
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
                 boxColour = Colours.None,
                 onMouseEnter = null,
                 onMouseClick = null,
                 onMouseLeave = null,
                 onMouseOver = null,
                 onMouseMove = null} = {}) {
        super({parent: parent, x: x, y: y, width: width, height: height, padding: padding, margin: margin, id: id, opacity: opacity, backgroundColour,
               onMouseEnter, onMouseClick, onMouseLeave, onMouseOver, onMouseMove});

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

    setup(opts = {}) {
        super.setup(opts);
        this.box = this.group.append("rect");
    }

    redraw(opts = {}) {
        this.updateWidth();
        this.updateHeight();

        super.redraw(opts);

        this.background.attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", this._backgroundColour);

        this.box.attr("y", this.paddingTop)
            .attr("x", this.paddingLeft)
            .attr("width", this.boxWidth)
            .attr("height", this.boxHeight)
            .attr("fill", this.boxColour);
    }
}
