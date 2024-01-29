// ViewTools: Class of helper functions used only for the view
export class ViewTools {

    /* Returns selected option given a select html tag selector or element */
    static getSelector(element) {
        if (typeof element === 'string') {
            element = d3.select(element);
        }

        return element.property("value");
    }
}