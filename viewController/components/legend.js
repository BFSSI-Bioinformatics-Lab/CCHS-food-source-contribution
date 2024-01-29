import { SvgComponent } from "./component.js";
import { Colours, DefaultDims, TextWrap, DefaultAttributes } from "../../assets/assets.js";
import { TextBox } from "./textBox.js";
import { Box } from "./box.js";
import { Func } from "../../tools/func.js";


// LegendItem: Class for a row itme in the legend
export class LegendItem extends SvgComponent {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length,
                 padding = 0,
                 margin = 0,
                 colourBoxWidth = DefaultDims.length,
                 colourBoxHeight = DefaultDims.length,
                 textPadding = 0,
                 fontSize = DefaultDims.fontSize,
                 name = "",
                 legendColour = Colours.None,
                 backgroundColour = Colours.None,
                 id = null,
                 opacity = DefaultAttributes.opacity,
                 textWrap = TextWrap.NoWrap,
                 onMouseEnter = null,
                 onMouseClick = null} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, id: id, opacity: opacity, padding: padding, margin: margin, onMouseEnter: onMouseEnter, onMouseClick: onMouseClick});

        this._backgroundColour = backgroundColour;

        // different individual parts of the legend item
        this.box = null;
        this.colourBox = new Box({x: this.paddingLeft, 
                                  y: this.paddingTop,
                                  boxWidth: colourBoxWidth,
                                  boxHeight: colourBoxHeight,
                                  backgroundColour: this.backgroundColour,
                                  boxColour: legendColour});

        this.textBox = new TextBox({x: this.paddingLeft + this.colourBoxWidth, 
                                    y: this.paddingTop, 
                                    text: name, 
                                    fontSize: fontSize, 
                                    padding: textPadding,
                                    textWrap: textWrap, 
                                    backgroundColour: this.backgroundColour });
    }

    // name(): Getter for name
    get name() {
        return this.textBox.name;
    }

    // name(newName): Setter for name
    set name(newName) {
        this.textBox.name = newName;
    }

    // fontSize(): Getter for fontSize
    get fontSize() {
        return this.textBox.fontSize;
    }

    // fontSize(newFontSize): Setter for fontSize
    set fontSize(newFontSize) {
        this.textBox.fontSize = newFontSize;
    }

    // textPadding(): Getter for 'textPadding'
    get textPadding() {
        return this.textBox.padding;
    }

    // textPadding(newTextPadding): Setter for 'textPadding'
    set textPadding(newTextPadding) {
        this.textBox.setupDims("padding", newTextPadding);
    }

    // textWrap(): Getter for textWrap
    get textWrap() {
        return this.textBox.textWrap;
    }

    // textWrap(newTextWrap): Setter for textWrap
    set textWrap(newTextWrap) {
        this.textBox.textWrap = newTextWrap;
    }

    // backgroundColour(): Getter for backgroundColour
    get backgroundColour() {
        return this._backgroundColour;
    }

    // backgroundColour(newBackgroundColour): Setter for backgroundColour
    set backgroundColour(newBackgroundColour) {
        this._backgroundColour = newBackgroundColour;
        this.textBox.backgroundColour = newBackgroundColour;
    }

    // colourBoxWidth(): Getter for colourBoxWidth
    get colourBoxWidth() {
        return this.colourBox.boxWidth;
    }

    // colourBoxWidth(newColourBoxWidth): Setter for colourBoxWidth
    set colourBoxWidth(newColourBoxWidth) {
        this.colourBox.boxWidth = newColourBoxWidth;
    }

    // colourBoxHeight(): Getter for colourBoxHeight
    get colourBoxHeight() {
        return this.colourBox.boxHeight;
    }

    // colourBoxHeight(colourBoxHeight): Setter for colourBoxHeight
    set colourBoxHeight(newColourBoxHeight) {
        this.colourBox.boxHeight = newColourBoxHeight;
    }

    // legendColour(): Getter for legendColour
    get legendColour() {
        return this.colourBox.boxColour;
    }

    // legendColour(newLegendColour): Setter for legendColour
    set legendColour(newLegendColour) {
        this.colourBox.boxColour = newLegendColour;
    }

    // updateWidth(): Updates the width to fit all the elements of the legend item
    updateWidth() {
        this.width = Math.max(this.width, this.paddingLeft + this.colourBoxWidth + this.textBox.fullWidth + this.paddingRight);
    }

    // updateHeight(): Updates the height to fit all the elements of the legend item
    updateHeight() {
        this.height = Math.max(this.height, this.paddingTop + Math.max(this.colourBoxHeight, this.textBox.fullHeight) + this.paddingBottom);
    }

    setup() {
        super.setup();
        this.box = this.group.append("rect");

        this.colourBox.parent = this.group;
        this.colourBox.setup();

        this.textBox.parent = this.group;
        this.textBox.setup();
    }

    remove(opts = {}) {
        this.colourBox.remove(opts);
        this.textBox.remove(opts);
    }

    redraw(opts = {}) {
        this.colourBox.redraw(opts);
        this.textBox.redraw(opts);

        // redraw the overall group
        this.updateWidth();
        this.updateHeight();
        super.redraw(opts);

        this.box.attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", this._backgroundColour);
    }
}


// Legend: Class for a graph legend
export class Legend extends SvgComponent {
    constructor({parent = null, 
                 x = DefaultDims.pos, 
                 y = DefaultDims.pos, 
                 width = DefaultDims.length, 
                 height = DefaultDims.length,
                 padding = 0,
                 margin = 0,
                 textPadding = 0,
                 legendItemPadding = 0,
                 fontSize = DefaultDims.fontSize,
                 colourBoxWidth = DefaultDims.length,
                 colourBoxHeight = DefaultDims.length,
                 backgroundColour = Colours.None,
                 id = null,
                 data = [],
                 opacity = DefaultAttributes.opacity,
                 legendItemMouseEnter = null,
                 legendItemMouseClick = null} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, id: id, opacity: opacity, padding: padding, margin: margin});

        this._textPadding = textPadding;
        this._legendItemPadding = legendItemPadding;
        this.fontSize = fontSize;
        this.colourBoxWidth = colourBoxWidth;
        this.colourBoxHeight = colourBoxHeight;
        this._backgroundColour = backgroundColour;

        this._legendItemMouseEnter = legendItemMouseEnter;
        this._legendItemMouseClick = legendItemMouseClick;

        // assume data is a list of tuples where each element is:
        //  [name, colour]
        this._data = data;
        this._data
        this._dataChanged = true;

        // different individual parts of the legend
        this.legendItems = [];
        this.box = new Box({x: this.paddingLeft, 
                            y: this.paddingTop,
                            boxWidth: this.width,
                            boxHeight: this.height,
                            boxColour: this._backgroundColour});
    }

    // data(): Getter for data
    get data() {
        return this._data;
    }

    // data(newData): Setter for data
    set data(newData) {
        this._data = newData;
        this._dataChanged = true;
    }

    // textPadding(): Getter for textPadding
    get textPadding() {
        return this._textPadding;
    }

    // textPadding(): Setter for textPadding
    set textPadding(newTextPadding) {
        this._textPadding = newTextPadding;
        for (const legendItem of this.legendItems) {
            legendItem.textPadding = this._textPadding;
        }
    }

    // legendItemPadding(): Getter for legendItemPadding
    get legendItemPadding() {
        return this._legendItemPadding;
    }

    // legendItemPadding(newLegendItemPadding): Setter for legendItemPadding
    set legendItemPadding(newLegendItemPadding) {
        this._legendItemPadding = newLegendItemPadding;
        for (const legendItem of this.legendItems) {
            legendItem.padding = this._legendItemPadding;
        }
    }

    // backgroundColour(): Getter for backgroundColour
    get backgroundColour() {
        return this._backgroundColour;
    }

    // backgroundColour(newBackgroundColour): Setter for backgroundColour
    set backgroundColour(newBackgroundColour) {
        this._backgroundColour = newBackgroundColour;
        for (const legendItem of this.legend) {
            legendItem.backgroundColour = this._backgroundColour;
        }

        this.box.boxColour = this._backgroundColour;
    }

    // legendItemMouseEnter(): Getter for legendItemMouseEnter
    get legendItemMouseEnter() {
        return this.legendItemMouseEnter;
    }

    // legendItemMouseEnter(newLegendMouseEnter): Setter for legendItemMouseEnter
    set legendItemMouseEnter(newLegendMouseEnter) {
        this.legendItemMouseEnter = newLegendMouseEnter;
        for (const legendItem of this.legend) {
            legendItem.onMouseEnter = newLegendMouseEnter;
        }
    }

    get legendItemMouseClick() {
        return this.legendItemMouseClick;
    }

    set legendItemMouseClick(newLegendItemMouseClick) {
        this.legendItemMouseClick = newLegendItemMouseClick;
        for (const legendItem of this.legend) {
            legendItem.onMouseClick = newLegendItemMouseClick;
        }
    }

    // setupLegendItemMouseEvents(mouseEventFunc, name, colour): Setup the mouse event
    //  for a particular legend item
    setupLegendItemMouseEvents(mouseEventFunc, name, colour) {
        if (mouseEventFunc === null) {
            return null;
        }

        // deepcopy the arguments
        let args = this._legendItemMouseEnter.args;
        if (!Array.isArray(args)) {
            args = JSON.parse(JSON.stringify(this._legendItemMouseEnter.args));
        }

        let result = new Func(mouseEventFunc.func, args);
        result.setArg("name", name);
        result.setArg("colour", colour);

        return result;
    }

    // setupLegendItems(): Creates the classes for all the legend items
    setupLegendItems() {
        if (!this._dataChanged) {
            return;
        }

        this.legendItems = [];
        const dataLen = this._data.length;
        
        for (let i = 0; i < dataLen; ++i) {
            const legendData = this._data[i];
            const name = legendData[0];
            const colour = legendData[1];

            // setup the mouse events
            const legendItemMouseEnter = this.setupLegendItemMouseEvents(this._legendItemMouseEnter, name, colour);
            const legendItemMouseClick = this.setupLegendItemMouseEvents(this._legendItemMouseClick, name, colour);

            const legendItem = new LegendItem({parent: this.group,
                                               x: this.paddingLeft + this.marginLeft,
                                               padding: this.legendItemPadding,
                                               width: DefaultDims.length, 
                                               height: DefaultDims.length,
                                               colourBoxWidth: this.colourBoxWidth,
                                               colourBoxHeight: this.colourBoxHeight,
                                               textPadding: this._textPadding,
                                               fontSize: this.fontSize,
                                               backgroundColour: this._backgroundColour,
                                               name: name,
                                               legendColour: colour,
                                               onMouseEnter: legendItemMouseEnter,
                                               onMouseClick: legendItemMouseClick});

            this.legendItems.push(legendItem);
        }
    }

    setup() {
        super.setup();
        this.setupLegendItems();

        for (const legendItem of this.legendItems) {
            legendItem.setup();
        }

        this.box.parent = this.group;
        this.box.setup();
    }

    remove(opts = {}) {
        super.remove(opts);

        if (this._dataChanged) {
            this.group.selectAll("g").remove();
        }
    }

    redraw(opts = {}) {
        super.redraw(opts);

        this.setupLegendItems();
        let currentLegendItemYPos = this.paddingTop + this.marginTop;

        // draw out all the legend items
        for (const legendItem of this.legendItems) {
            legendItem.y = currentLegendItemYPos;
            legendItem.draw();

            currentLegendItemYPos +=  legendItem.fullHeight;
            this.width = Math.max(this.width, this.paddingLeft + legendItem.fullWidth + this.paddingRight);
        }

        this.height = Math.max(this.height, currentLegendItemYPos + this.paddingBottom - this.marginTop);
        this._dataChanged = false;

        this.box.boxWidth = this.width;
        this.box.boxHeight = this.height;
        this.box.redraw(); 
    }
};
