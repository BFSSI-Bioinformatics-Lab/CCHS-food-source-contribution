// viewTools: Class of helper functions used only for the view
export class viewTools {

    /* Returns selected option given a select html tag selector */
    static getSelector(id) {
        return d3.select(id).property("value");
    }
}