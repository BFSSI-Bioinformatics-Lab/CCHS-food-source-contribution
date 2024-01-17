
// Component: Abstract class for building a component used in the UI
export class Component {
    // draw(): First initializing for drawing the component
    draw() {
        this.setup();
        this.redraw();
    }

    // setup(): Performs any setup for drawing the component
    setup() {

    }

    // redraw(opts): Redraws only parts of the component that has any updates
    // Note: Is lighter weight compared to 'draw'
    redraw(opts = {}) {

    }

    // remove(opts): Remove some parts of the component
    remove(opts = {}) {

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
        this.remove(opts);
        this.redraw(opts);
    }
}