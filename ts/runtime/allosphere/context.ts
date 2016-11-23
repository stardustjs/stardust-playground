import * as vm from "vm";
import * as d3 from "d3";
import * as Stardust from "stardust-core";

export interface IUserCodeConfig {
    dataFile: string,
    backgroundColor: number[],
    viewType: "2D" | "3D",
    code: string;
    data: any;
}

export interface IUserCodeContext extends vm.Context {
    render?: () => void;
    animate?: (t: number) => void;
    setup?: () => void;
}

export class Context {
    private _script: vm.Script;
    private _context: IUserCodeContext;

    private _isInitialized: boolean;
    private _isStarted: boolean;

    constructor(config: IUserCodeConfig, platform: Stardust.Platform) {
        this._isInitialized = false;
        this._isStarted = false;
        try {
            this._script = new vm.Script(config.code, {
                filename: "main.js"
            });
        } catch(e) {
            console.log(e.message);
            console.log(e.stack);
            return;
        }
        this._isInitialized = true;

        this._context = vm.createContext({
            DATA: config.data,
            Stardust: Stardust,
            platform: platform,
            d3: d3
        }) as IUserCodeContext;
    }

    public start() {
        try {
            this._script.runInContext(this._context);
        } catch(e) {
            console.log(e.message);
            console.log(e.stack);
            return;
        }
        this._isStarted = true;
    }

    public setup() {
        if(this._isStarted && this._context.setup) {
            try {
                this._context.setup();
            } catch(e) {
                console.log(e.message);
                console.log(e.stack);
            }
        }
    }

    public render() {
        if(this._isStarted && this._context.render) {
            try {
                this._context.render();
            } catch(e) {
                console.log(e.message);
                console.log(e.stack);
            }
        }
    }

    public animate(t: number) {
        if(this._isStarted && this._context.animate) {
            try {
                this._context.animate(t);
            } catch(e) {
                console.log(e.message);
                console.log(e.stack);
            }
        }
    }
}