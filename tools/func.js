

// Func: Wrapper class for handling anonymous functions or
//  higher ordered functions
export class Func {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }

    // run(): Runs the function
    run() {
        if (Array.isArray(this.args)) {
            return this.func(...this.args);
        } else {
            return this.func(this.args);
        }
    }

    // setArg(name, value): Sets the arguments for the function
    setArg(name, value) {
        if (Array.isArray(this.args)) {
            this.args.push(value);
        } else {
            this.args[name] = value;
        }
    }
};