import { Component } from "./component.js";


// svgComponent: Abstract class to build a component used in a SVG
export class svgComponent extends Component {
    constructor(parent, x, y, width = 0, height = 0) {
        super();
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.group = null;
    }

    // setupGroup(): setups the overall group for the component
    #setupGroup() {
        this.group = this.parent.append("g")
                        .attr("transform", `translate(${this.x}, ${this.y})`);
    }

    draw() {
        this.#setupGroup();
    }
}