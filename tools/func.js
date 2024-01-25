

export class Func {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }

    run() {
        if (Array.isArray(this.args)) {
            return this.func(...this.args);
        } else {
            return this.func(this.args);
        }
    }

    setArg(name, value) {
        //console.log("SETTER: ", this.args, " AND ", Array.isArray(this.args));  

        if (Array.isArray(this.args)) {
            this.args.push(value);
        } else {
            this.args[name] = value;
        }
    }
};