////////////////////////////////////////////////////////////////////
//                                                                //
// Purpose: Handles drawing a legend                              //
//                                                                //
// What it Contains:                                              //
//      LegendItem: Class for the colour box and corresponding    //
//          description for a single key in the legend            //
//              - used to make the overall legend                 //
//                                                                //
//      Legend: a legend for some graph                           //
//              - created by the bar graph and the sunburst       //
//                  graph                                         //
//                                                                //
////////////////////////////////////////////////////////////////////


import { RectSvgComponent } from "./component.js";
import { Colours, DefaultDims, TextWrap, DefaultAttributes } from "../../assets/assets.js";
import { TextBox, Box } from "./textBox.js";
import { Func } from "../../tools/tools.js";


// LegendItem: Class for a row item in the legend
export class LegendItem extends RectSvgComponent {
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
                 borderColour = Colours.None,
                 borderWidth = 0,
                 id = null,
                 opacity = DefaultAttributes.opacity,
                 textWrap = TextWrap.NoWrap,
                 onMouseEnter = null,
                 onMouseClick = null,
                 onMouseLeave = null,
                 onMouseOver = null,
                 onMouseMove = null} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, id: id, opacity: opacity, padding: padding, margin: margin, 
               onMouseEnter: onMouseEnter, onMouseClick: onMouseClick, onMouseLeave: onMouseLeave, onMouseOver: onMouseOver, 
               onMouseMove: onMouseMove, backgroundColour, borderColour, borderWidth});

        // different individual parts of the legend item
        this.colourBox = new Box({x: this.paddingLeft, 
                                  y: this.paddingTop,
                                  boxWidth: colourBoxWidth,
                                  boxHeight: colourBoxHeight,
                                  backgroundColour: this.backgroundColour,
                                  boxColour: legendColour,
                                  onMouseEnter, onMouseClick, onMouseLeave, onMouseOver, onMouseMove});

        this.textBox = new TextBox({x: this.paddingLeft + this.colourBoxWidth, 
                                    y: this.paddingTop, 
                                    text: name, 
                                    fontSize: fontSize, 
                                    padding: textPadding,
                                    textWrap: textWrap, 
                                    backgroundColour: this.backgroundColour,
                                    onMouseEnter, onMouseClick, onMouseLeave, onMouseOver, onMouseMove});
    }

    get name() {
        return this.textBox.name;
    }

    set name(newName) {
        this.textBox.name = newName;
    }

    get fontSize() {
        return this.textBox.fontSize;
    }

    set fontSize(newFontSize) {
        this.textBox.fontSize = newFontSize;
    }

    get textPadding() {
        return this.textBox.padding;
    }

    set textPadding(newTextPadding) {
        this.textBox.setupDims("padding", newTextPadding);
    }

    get textWrap() {
        return this.textBox.textWrap;
    }

    set textWrap(newTextWrap) {
        this.textBox.textWrap = newTextWrap;
    }

    get backgroundColour() {
        return this._backgroundColour;
    }

    set backgroundColour(newBackgroundColour) {
        this._backgroundColour = newBackgroundColour;
        this.textBox.backgroundColour = newBackgroundColour;
    }

    get colourBoxWidth() {
        return this.colourBox.boxWidth;
    }

    set colourBoxWidth(newColourBoxWidth) {
        this.colourBox.boxWidth = newColourBoxWidth;
    }

    get colourBoxHeight() {
        return this.colourBox.boxHeight;
    }

    set colourBoxHeight(newColourBoxHeight) {
        this.colourBox.boxHeight = newColourBoxHeight;
    }

    get legendColour() {
        return this.colourBox.boxColour;
    }

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

    setup(opts = {}) {
        super.setup(opts);

        this.colourBox.parent = this.group;
        this.colourBox.setup(opts);

        this.textBox.parent = this.group;
        this.textBox.setup(opts);
    }

    clear(opts = {}) {
        this.colourBox.clear(opts);
        this.textBox.clear(opts);
    }

    redraw(opts = {}) {
        this.colourBox.redraw(opts);
        this.textBox.redraw(opts);

        // redraw the overall group
        this.updateWidth();
        this.updateHeight();
        super.redraw(opts);
    }
}


// Legend: Class for a graph legend
export class Legend extends RectSvgComponent {
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
                 borderColour = Colours.None,
                 borderWidth = 0,
                 id = null,
                 data = [],
                 opacity = DefaultAttributes.opacity,
                 legendItemMouseEnter = null,
                 legendItemMouseClick = null,
                 legendItemMouseLeave = null,
                 legendItemMouseOver = null,
                 legendItemMouseMove = null,
                 onMouseLeave = null,
                 onMouseEnter = null} = {}) {

        super({parent: parent, x: x, y: y, width: width, height: height, id: id, opacity: opacity, padding: padding, margin: margin, 
               onMouseLeave: onMouseLeave, backgroundColour, borderColour, borderWidth, onMouseEnter});

        this._textPadding = textPadding;
        this._legendItemPadding = legendItemPadding;
        this.fontSize = fontSize;
        this.colourBoxWidth = colourBoxWidth;
        this.colourBoxHeight = colourBoxHeight;
        this._backgroundColour = backgroundColour;

        this._legendItemMouseEnter = legendItemMouseEnter;
        this._legendItemMouseClick = legendItemMouseClick;
        this._legendItemMouseLeave = legendItemMouseLeave;
        this._legendItemMouseOver = legendItemMouseOver;
        this._legendItemMouseMove = legendItemMouseMove;

        // assume data is a list of tuples where each element is:
        //  [name, colour]
        this._data = data;
        this._data
        this._dataChanged = true;

        // different individual parts of the legend
        this.legendItems = [];
    }

    get data() {
        return this._data;
    }

    set data(newData) {
        this._data = newData;
        this._dataChanged = true;
    }

    get textPadding() {
        return this._textPadding;
    }

    // setLegendItemAtt(attName, value): Sets 'value' to the attribute 'attName'
    //  for all of the legend items
    setLegendItemAtt(attName, value) {
        for (const legendItem of this.legendItems) {
            legendItem[attName] = value;
        }
    }

    set textPadding(newTextPadding) {
        this._textPadding = newTextPadding;
        this.setLegendItemAtt("textPadding", this._textPadding);
    }

    get legendItemPadding() {
        return this._legendItemPadding;
    }

    set legendItemPadding(newLegendItemPadding) {
        this._legendItemPadding = newLegendItemPadding;
        this.setLegendItemAtt("padding", this._legendItemPadding);
    }

    get backgroundColour() {
        return this._backgroundColour;
    }

    set backgroundColour(newBackgroundColour) {
        this._backgroundColour = newBackgroundColour;
        this.setLegendItemAtt("backgroundColour", this._backgroundColour);
    }

    get legendItemMouseEnter() {
        return this._legendItemMouseEnter;
    }

    set legendItemMouseEnter(newLegendMouseEnter) {
        this._legendItemMouseEnter = newLegendMouseEnter;
        this.setLegendItemAtt("onMouseEnter", newLegendMouseEnter);
    }

    get legendItemMouseClick() {
        return this._legendItemMouseClick;
    }

    set legendItemMouseClick(newLegendItemMouseClick) {
        this._legendItemMouseClick = newLegendItemMouseClick;
        this.setLegendItemAtt("onMouseClick", newLegendItemMouseClick);
    }

    get legendItemMouseLeave() {
        return this._legendItemMouseLeave; 
    }

    set legendItemMouseLeave(newlegendItemMouseLeave) {
        this._legendItemMouseLeave = newlegendItemMouseLeave;
        this.setLegendItemAtt("onMouseLeave", newlegendItemMouseLeave);
    }

    get legendItemMouseOver() {
        return this._legendItemMouseOver;
    }

    set legendItemMouseOver(newLegendItemMouseOver) {
        this._legendItemMouseOver = newLegendItemMouseOver;
        this.setLegendItemAtt("onMouseOver", newLegendItemMouseOver);
    }

    get legendItemMouseMove() {
        return this._legendItemMouseMove;
    }

    set legendItemMouseMove(newLegendItemMouseMove) {
        this._legendItemMouseOver = newLegendItemMouseMove;
        this.setLegendItemAtt("onMouseMove", newLegendItemMouseMove);
    }

    // setupLegendItemMouseEvents(mouseEventFunc, name, colour): Setup the mouse event
    //  for a particular legend item
    setupLegendItemMouseEvents(mouseEventFunc, name, colour, legendItem) {
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
        result.setArg("legendItem", legendItem);

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
                                               legendColour: colour
                                            });

            // setup the mouse events
            const legendItemMouseEnter = this.setupLegendItemMouseEvents(this._legendItemMouseEnter, name, colour, legendItem);
            const legendItemMouseClick = this.setupLegendItemMouseEvents(this._legendItemMouseClick, name, colour, legendItem);
            const legendItemMouseLeave = this.setupLegendItemMouseEvents(this._legendItemMouseLeave, name, colour, legendItem);
            const legendItemMouseOver = this.setupLegendItemMouseEvents(this._legendItemMouseOver, name, colour, legendItem);
            const legendItemMouseMove = this.setupLegendItemMouseEvents(this._legendItemMouseMove, name, colour, legendItem);
            
            legendItem.updateAtts({onMouseEnter: legendItemMouseEnter, onMouseClick: legendItemMouseClick, onMouseLeave: legendItemMouseLeave,
                                   onMouseOver: legendItemMouseOver, onMouseMove: legendItemMouseMove});

            this.legendItems.push(legendItem);
        }
    }

    setup(opts = {}) {
        super.setup(opts);
        this.setupLegendItems();

        for (const legendItem of this.legendItems) {
            legendItem.setup(opts);
        }
    }

    clear(opts = {}) {
        super.clear(opts);

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

        this.redrawBackground();
    }
};
