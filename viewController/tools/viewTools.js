// ViewTools: Class of helper functions used only for the view
export class ViewTools {
    WidthCanvas = undefined;

    /* Returns selected option given a select html tag selector or element */
    static getSelector(element) {
        if (typeof element === 'string') {
            element = d3.select(element);
        }

        return element.property("value");
    }


    // getTextWidth(text, fontSize, fontFamily): Retrieves the width of 'text' that is more
    //      stable than D3's getComputedTextLength
    // Note: D3's getComputedTextLength requires the text element to be rendered to be
    //      able to get the text length. If the text element is hidden or not rendered yet, then
    //      getComputedTextLength will always return 0
    //
    // Reference: http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
    static getTextWidth(text, fontSize, fontFamily) {
        // if given, use cached canvas for better performance
        // else, create new canvas
        var canvas = this.WidthCanvas || (this.WidthCanvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = fontSize + 'px ' + fontFamily;
        return context.measureText(text).width;
    };
}