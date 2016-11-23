import { Dispatcher } from "flux";

export let GlobalDispatcher = new Dispatcher<Action>();

export class Action {
    public dispatch() {
        GlobalDispatcher.dispatch(this);
    }
}

export class RunInAlloSphere extends Action {
    constructor(
    ) { super(); }
}

export class LoadExample extends Action {
    constructor(
        public exampleName: string
    ) { super(); }
}

export class Compile extends Action {
    constructor(
    ) { super(); }
}