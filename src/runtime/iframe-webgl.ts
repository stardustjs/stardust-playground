import * as Stardust from "./bundle";
import * as d3 from "d3";
import * as protocol from "../runtime/protocol";

interface IUserCodeConfig {
    dataFile: string,
    backgroundColor: number[],
    compileIndex: string,
    viewType: "2D" | "3D"
}

interface IUserCodeExports {
    render: () => void;
    animate: (t: number) => void;
    setup: () => void;
}

declare let UserCodeConfig: IUserCodeConfig;
declare let UserCodeExports: IUserCodeExports;
declare let UserCode: () => void;

function setWindowProperty(name: string, obj: any) {
    (window as any)[name] = obj;
}

function postMessage(msg: protocol.IFrameMessage) {
    parent.postMessage(msg, "*");
}

function printMessage(message: string, type: string) {
    postMessage({
        type: "message",
        message: {
            message: message,
            type: type
        }
    });
}

let controlCallbacks = new Stardust.Dictionary<(value: protocol.ControlValue) => void>();
window.onmessage = (e: MessageEvent) => {
    let msg = e.data as protocol.IFrameMessage
    switch (msg.type) {
        case "control.event": {
            if (controlCallbacks.has(msg.controlEvent.name)) {
                controlCallbacks.get(msg.controlEvent.name)(msg.controlEvent.value);
            }
        } break;
    }
}

let canvasSelection = d3.select("body").append("canvas");
let canvasNode = canvasSelection.node() as HTMLCanvasElement;
let svg = d3.select("body").append("svg");

svg.attr("width", window.innerWidth);
svg.attr("height", window.innerHeight);

let platform: Stardust.WebGLCanvasPlatform2D | Stardust.WebGLCanvasPlatform3D;

if (UserCodeConfig.viewType == "2D") {
    platform = Stardust.platform("webgl-2d", canvasNode, window.innerWidth, window.innerHeight) as any as Stardust.WebGLCanvasPlatform2D;
}
if (UserCodeConfig.viewType == "3D") {
    platform = Stardust.platform("webgl-3d", canvasNode, window.innerWidth, window.innerHeight) as any as Stardust.WebGLCanvasPlatform3D;
    platform.set3DView(Math.PI / 4, 0.1, 1000);
    platform.setPose(new Stardust.Pose(new Stardust.Vector3(0, 0, 500), new Stardust.Quaternion(0, 0, 0, 1)));
    window.onmousedown = (event: MouseEvent) => {
        let pose0 = platform.pose;
        let x0 = event.screenX as number;
        let y0 = event.screenY as number;
        let onMouseMove = (e: MouseEvent) => {
            let x1 = e.screenX as number;
            let y1 = e.screenY as number;
            let dx = x1 - x0;
            let dy = y1 - y0;
            if (dx == 0 && dy == 0) {
                platform.setPose(pose0);
            } else {
                let len = Math.sqrt(dx * dx + dy * dy);
                let cq = Stardust.Quaternion.Rotation(new Stardust.Vector3(dy / len, dx / len, 0), -len / 100);
                let newPose = new Stardust.Pose(
                    pose0.rotation.rotate(cq.rotate(pose0.rotation.conj().rotate(pose0.position))),
                    pose0.rotation.mul(cq)
                );
                platform.setPose(newPose);
            }
            doReRender();
        };
        let onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }
}

function reRender() {
    platform.clear(UserCodeConfig.backgroundColor || [1, 1, 1, 1]);
    if (UserCodeExports.render) {
        try {
            UserCodeExports.render();
        } catch (e) {
            printMessage("Error at Javascript code render(): " + e.message + "\n" + e.stack, "error");
            return;
        }
    }
}

function doReRender() {
    requestAnimationFrame(reRender);
}

window.onresize = () => {
    platform.resize(window.innerWidth, window.innerHeight);
    svg.attr("width", window.innerWidth);
    svg.attr("height", window.innerHeight);
    doReRender();
}

setWindowProperty("Stardust", Stardust);
setWindowProperty("d3", d3);
setWindowProperty("svg", svg);
setWindowProperty("platform", platform);

setWindowProperty("reRender", doReRender);
setWindowProperty("print", (message: string) => {
    postMessage({
        type: "message",
        message: {
            message: message,
            type: "print"
        }
    });
});
setWindowProperty("addSlider", (name: string, mark: Stardust.Mark, attr: string, defaultValue: number, min: number, max: number) => {
    postMessage({
        type: "control.add",
        control: {
            name: name,
            description: "",
            type: "slider",
            min: min,
            max: max,
            value: defaultValue
        }
    });
    mark.attr(attr, defaultValue);
    controlCallbacks.set(name, (value: number) => {
        mark.attr(attr, value);
        doReRender();
    })
});

function doStartup(data: any) {
    setWindowProperty("DATA", data);
    try {
        UserCode();
    } catch (e) {
        printMessage("Error at Javascript code: " + e.message + "\n" + e.stack, "error");
        return;
    }
    if (UserCodeExports.setup) {
        try {
            UserCodeExports.setup();
        } catch (e) {
            printMessage("Error at Javascript code setup(): " + e.message + "\n" + e.stack, "error");
            return;
        }
    }
    if (UserCodeExports.animate) {
        let t0 = new Date().getTime();
        let totalFrames = 0;
        let animateFunction = () => {
            let t1 = new Date().getTime();
            let t = (t1 - t0) / 1000;
            try {
                UserCodeExports.animate(t);
            } catch (e) {
                printMessage("Error at Javascript code animate(): " + e.message + "\n" + e.stack, "error");
                return;
            }
            totalFrames += 1;
            reRender();
            requestAnimationFrame(animateFunction);
            if (totalFrames % 100 == 0) {
                console.log("FPS", (totalFrames / t).toFixed(1));
            }
        }
        requestAnimationFrame(animateFunction);
    }
    reRender();
}

if (UserCodeConfig.dataFile != null && UserCodeConfig.dataFile != "") {
    if (UserCodeConfig.dataFile.match(/\.csv$/i)) {
        d3.csv(UserCodeConfig.dataFile).then((data) => {
            doStartup(data);
        });
    }
    if (UserCodeConfig.dataFile.match(/\.tsv$/i)) {
        d3.tsv(UserCodeConfig.dataFile).then((data) => {
            doStartup(data);
        });
    }
    if (UserCodeConfig.dataFile.match(/\.json$/i)) {
        d3.json(UserCodeConfig.dataFile).then((data) => {
            doStartup(data);
        });
    }
} else {
    doStartup(null);
}