import { DefaultDims, DefaultAttributes, Colours } from "../../assets/assets.js";


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
                 model = null,
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length, 
                 padding = 0,
                 margin = 0,
                 id = null, 
                 opacity = DefaultAttributes.opacity,
                 onMouseEnter = null,
                 onMouseClick = null,
                 onMouseLeave = null,
                 onMouseOver = null,
                 onMouseMove = null} = {}) {
        super({model: model});
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
        this._onMouseLeave = onMouseLeave;
        this._onMouseLeaveChanged = true;
        this._onMouseOver = onMouseOver;
        this._onMouseOverChanged = true;
        this._onMouseMove = onMouseMove;
        this._onMouseMoveChanged = true;

        this.setupDims("padding", padding);
        this.setupDims("margin", margin);

        this.group = null;
    }

    get padding() {
        return this.getDims("padding");
    }

    set padding(newPadding) {
        this.setupDims("padding", newPadding);
    }

    get margin() {
        return this.getDims("margin");
    }

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

    get onMouseEnter() {
        return this._onMouseEnter;
    }

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

    get onMouseLeave() {
        return this._onMouseLeave;
    }

    set onMouseLeave(newMouseOut) {
        this._onMouseLeave = newMouseOut;
        this._onMouseLeaveChanged = true;
    }

    get onMouseOver() {
        return this._onMouseOver;
    }

    set onMouseOver(newMouseOver) {
        this._onMouseOver = newMouseOver;
        this._onMouseOverChanged = true;
    }

    get onMouseMove() {
        return this._onMouseMove;
    }

    set onMouseMove(newMouseMove) {
        this._onMouseMove = newMouseMove;
        this._onMouseMoveChanged = true;
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
    }
}


// BackgroundSVGComponent: SVG component with a shaped background
export class BackgroundSVGComponent extends SvgComponent {
    constructor({parent = null, 
        model = null,
        x = DefaultDims.pos, 
        y = DefaultDims.pos, 
        width = DefaultDims.length, 
        height = DefaultDims.length, 
        padding = 0,
        margin = 0,
        id = null, 
        opacity = DefaultAttributes.opacity,
        backgroundColour = Colours.None,
        borderColour = Colours.None,
        borderWidth = 0,
        onMouseEnter = null,
        onMouseClick = null,
        onMouseLeave = null,
        onMouseOver = null,
        onMouseMove = null} = {}) {

        super({parent, model, x, y, width, height, padding, margin, id, opacity, onMouseEnter, onMouseClick, onMouseLeave, onMouseOver, onMouseMove});
        this._backgroundColour = backgroundColour;
        this.borderColour = borderColour;
        this.borderWidth = borderWidth;

        // individual elements for the component
        this.background = null;
    }

    get backgroundColour() {
        return this._backgroundColour;
    }

    set backgroundColour(newBackgroundColour) {
        this._backgroundColour = newBackgroundColour;
    }

    // setupBackground: Method to create the shape for the background
    // Note: should return some SVG shape
    setupBackground() {}

    // redrawBackground: Method to redraw certain attributes of the shape
    redrawBackground() {}

    setup(opts = {}) {
        super.setup(opts);
        this.background = this.setupBackground();
        this.group.style('pointer-events', 'all');
    }

    redraw(opts = {}) {
        super.redraw(opts);
        this.redrawBackground();
        this.setMouseEvents();
    }

    // setMouseEvents(): Sets the mouse events
    setMouseEvents() {
        this.setComponentMouseEvents();

        this._onMouseClickChanged = false;
        this._onMouseEnterChanged = false;
        this._onMouseLeaveChanged = false;
        this._onMouseOverChanged = false;
        this._onMouseMoveChanged = false;
    }

    // setComponentMouseEvents(): Sets the mouse events for the entire component
    setComponentMouseEvents() {
        this.setElementMouseEvents(this.group);
        this.setElementMouseEvents(this.background);
    }

    // setElementMouseEvents(element): Sets the mouse events for an element 
    setElementMouseEvents(element) {
        // add all the mouse events to the background shape
        if (this._onMouseEnter !== null && this._onMouseEnterChanged) {
            element.on("mouseenter", () => { this._onMouseEnter.run() });
        }

        if (this._onMouseClick !== null && this._onMouseClickChanged) {
            element.on("click", () => { this._onMouseClick.run() });
        }

        if (this._onMouseLeave !== null && this._onMouseLeaveChanged) {
            element.on("mouseleave", () => { this._onMouseLeave.run() });
        }

        if (this._onMouseOver !== null && this._onMouseOverChanged) {
            element.on("mouseover", () => { this._onMouseOver.run() });
        }

        if (this._onMouseMove !== null && this._onMouseMoveChanged) {
            element.on("mousemove", () => { this._onMouseMove.run() });
        }
    }
}


// RectSvgComponent: An SVG component where the overall shape for the background of the component
//  is a rectangle
export class RectSvgComponent extends BackgroundSVGComponent {
    constructor({parent = null, 
        model = null,
        x = DefaultDims.pos, 
        y = DefaultDims.pos, 
        width = DefaultDims.length, 
        height = DefaultDims.length, 
        padding = 0,
        margin = 0,
        id = null, 
        opacity = DefaultAttributes.opacity,
        backgroundColour = Colours.None,
        borderColour = Colours.None,
        borderWidth = 0,
        onMouseEnter = null,
        onMouseClick = null,
        onMouseLeave = null,
        onMouseOver = null,
        onMouseMove = null} = {}) {
        
        super({parent, model, x, y, width, height, padding, margin, id, opacity, onMouseEnter, onMouseClick, onMouseLeave, 
               onMouseOver, onMouseMove, backgroundColour, borderColour, borderWidth});
    }

    // setupShape(): Creates a rectangular background
    setupBackground() {
        return this.group.append("rect");
    }

    redrawBackground() {
        this.background.attr("height", this.height)
            .attr("width", this.width)
            .attr("fill", this._backgroundColour)
            .attr("stroke", this.borderColour)
            .attr("stroke-width", this.borderWidth);
    }
}