import { DefaultDims, DefaultAttributes } from "../../assets/assets.js";


// Component: Abstract class for building a component used in the UI
export class Component {
    constructor({model = null} = {}) {
        this.model = model;
        this._initialized = false;
    }

    // draw(): First initializing for drawing the component
    draw({atts = {}, opts = {}} = {}) {
        this.updateAtts(atts);
        this.setup(opts);
        this.redraw(opts);
        this._initialized = true;
    }

    // setup(): Performs any setup for drawing the component
    setup(opts = {}) {

    }

    // redraw(opts): Redraws only parts of the component that has any updates
    // Note: Is lighter weight compared to 'draw'
    redraw(opts = {}) {

    }

    // clear(opts): Remove some parts of the component
    clear(opts = {}) {

    }

    // updateAtts(atts): Updates the attributes for the component
    updateAtts(atts) {
        for (const attName in atts) {
            if (this[attName] !== undefined) {
                this[attName] = atts[attName];
            }
        }
    }

    // update(): Updates the component
    update({atts = {}, opts = {}} = {}) {
        this.updateAtts(atts);
        this.clear(opts);
        this.redraw(opts);
    }

    // render(): Changes the view of the component
    render({atts = {}, opts = {}} = {}) {
        if (this._initialized) {
            this.update({atts: atts, opts: opts});
            return;
        }

        this.draw({atts: atts, opts: opts});
    }
}


// svgComponent: Abstract class to build a component used in a SVG
export class SvgComponent extends Component {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length, 
                 padding = 0,
                 margin = 0,
                 id = null, 
                 opacity = DefaultAttributes.opacity,
                 onMouseEnter = null,
                 onMouseClick = null} = {}) {
        super();
        this.parent = parent;
        this.id = id;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.opacity = opacity;
        
        // All mouse events have type Func or null
        this._onMouseEnter = onMouseEnter;
        this._onMouseEnterChanged = true;
        this._onMouseClick = onMouseClick;
        this._onMouseClickChanged = true;

        this.setupDims("padding", padding);
        this.setupDims("margin", margin);

        this.group = null;
    }

    // padding(): Getter for padding
    get padding() {
        return this.getDims("padding");
    }

    // padding(newPadding): Setter for padding
    set padding(newPadding) {
        this.setupDims("padding", newPadding);
    }

    // margin(): Getter for margin
    get margin() {
        return this.getDims("margin");
    }

    // margin(): Setter for margin
    set margin(newMargin) {
        this.setupDims("margin", newMargin);
    }

    // fullWidth(): Getter for the full width of the component
    get fullWidth() {
        return this.marginLeft + this.width + this.marginRight;
    }

    // fullHeight(): Getter for the full height of the component
    get fullHeight() {
        return this.marginTop + this.height + this.marginBottom;
    }

    // setupGroup(): setups the overall group for the component
    #setupGroup() {
        this.group = this.parent.append("g");

        if (this.id !== null) {
            this.group.attr("id", this.id);
        }
    }

    // onMouseEnter(): Getter for onMouseEnter
    get onMouseEnter() {
        return this._onMouseEnter;
    }

    // onMouseEnter(newMouseEnter): Setter for onMouseEnters
    set onMouseEnter(newMouseEnter) {
        this._onMouseEnter = newMouseEnter;
        this._onMouseEnterChanged = true;
    }

    get onMouseClick() {
        return this._onMouseClick;
    }

    set onMouseClick(newMouseClick) {
        this._onMouseClick = newMouseClick;
        this._onMouseClickChanged = true;
    }

    // getDims(dimName): Retrieves the dimensions for 'dimName'
    getDims(dimName) {
        const leftDimName = `${dimName}Left`;
        const topDimName = `${dimName}Top`;
        const rightDimName = `${dimName}Right`;
        const bottomDimName = `${dimName}Bottom`;

        let result = {};
        result[leftDimName] = this[leftDimName];
        result[topDimName] = this[topDimName];
        result[rightDimName] = this[rightDimName];
        result[bottomDimName] = this[bottomDimName];

        return result;
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
    setup(opts = {}) {
        this.#setupGroup();
    }

    redraw(opts = {}) {
        this.group.attr("transform", `translate(${this.x + this.marginLeft}, ${this.y + this.marginTop})`)
            .attr("opacity", this.opacity);

        if (this._onMouseEnter !== null && this._onMouseEnterChanged) {
            this.group.on("mouseenter", () => this._onMouseEnter.run());
            this._onMouseEnterChanged = false;
        }

        if (this._onMouseClick !== null && this._onMouseClickChanged) {
            this.group.on("click", () => this._onMouseClick.run())
        }
    }
}