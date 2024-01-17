import { Component } from "./component.js";
import { DefaultDims } from "../../assets/dimensions/defaultDimensions.js";
import { DefaultAttributes } from "../../assets/strings/defaultAttributes.js";


// svgComponent: Abstract class to build a component used in a SVG
export class svgComponent extends Component {
    constructor({parent = null, x = DefaultDims.pos, y = DefaultDims.pos, width = DefaultDims.length, height = DefaultDims.length, 
                 id = null, opacity = DefaultAttributes.opacity} = {}) {
        super();
        this.parent = parent;
        this.id = id;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.opacity = opacity;

        this.group = null;
    }

    // setupGroup(): setups the overall group for the component
    #setupGroup() {
        this.group = this.parent.append("g");

        if (this.id !== null) {
            this.group.attr("id", this.id);
        }
    }

    // setupDims(dimName, values): Setups the padding and margin for the textbox
    setupDims(dimName, values) {
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

            this[leftDimName] = values;
            this[topDimName] = values;
            this[rightDimName] = values;
            this[bottomDimName] = values;
        
        // if 'values' is an array of length 2, first value is horizontal while second value is vertical
        } else if (valueIsArray && values.length == 2) {
            const horizontalValue = values[0];
            const verticalValue = values[1];

            this[leftDimName] = horizontalValue;
            this[topDimName] = verticalValue;
            this[rightDimName] = horizontalValue;
            this[bottomDimName] = verticalValue;
        
        // if 'values' is an array of that specified values for all directions
        } else if (valueIsArray && values.length >= 4) {
            this[leftDimName] = values[0];
            this[topDimName] = values[1];
            this[rightDimName] = values[2];
            this[bottomDimName] = values[3];
        
        // if 'values' is a dictionary of that specified values for all directions
        } else if (values.constructor == Object) {
            this[leftDimName] = values[leftDimName];
            this[topDimName] = values[topDimName];
            this[rightDimName] = values[rightDimName];
            this[bottomDimName] = values[bottomDimName];           
        }
    }

    // setup(): Performs any setup for drawing the component
    setup() {
        this.#setupGroup();
    }

    redraw(opts = {}) {
        this.group.attr("transform", `translate(${this.x}, ${this.y})`)
            .attr("opacity", this.opacity);
    }
}