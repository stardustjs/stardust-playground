import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";
import * as d3 from "d3";

export interface IS3RenderingViewProps {
    dataFile: string;
    viewType: "2D" | "3D";
    backgroundColor: number[];
    jsCode: string;
    compileIndex?: string;

    width: number;
    height: number;
}

export interface ControlInfo {
    type: "slider";
    name: string;
}

export interface ControlInfoSlider extends ControlInfo {
    onChange: (newValue: number) => void;
    value: number;
    min: number;
    max: number;
}

export interface IS3RenderingViewState {
    messages: string[];
    controls: ControlInfo[];
}

export class S3RenderingView extends React.Component<IS3RenderingViewProps, IS3RenderingViewState> {
    refs: {
        [ name: string ]: Element,
        canvas: HTMLCanvasElement,
        svg: SVGElement
    }

    constructor(props: IS3RenderingViewProps) {
        super(props);
        this.state = {
            messages: [],
            controls: []
        };
    }

    _GL: WebGLRenderingContext;
    _platform: StardustWebGL.WebGLPlatform;
    _timerCurrent: NodeJS.Timer;
    _reRender: () => void;
    _userCodeFinalize: () => void;

    public componentDidMount() {
        let options = {
            preserveDrawingBuffer: true
        };
        this._GL = (this.refs.canvas.getContext("webgl", options) || this.refs.canvas.getContext("experimental-webgl", options)) as WebGLRenderingContext;
        this._platform = new StardustWebGL.WebGLPlatform(this._GL);

        this._GL.clearColor(this.props.backgroundColor[0], this.props.backgroundColor[1], this.props.backgroundColor[2], 1);
        this._GL.clear(this._GL.COLOR_BUFFER_BIT | this._GL.DEPTH_BUFFER_BIT);
        this._GL.disable(this._GL.DEPTH_TEST);
        this._GL.enable(this._GL.BLEND);
        this._GL.blendFuncSeparate(this._GL.SRC_ALPHA, this._GL.ONE_MINUS_SRC_ALPHA, this._GL.ONE, this._GL.ONE_MINUS_SRC_ALPHA);

        this.startUserProgram();
    }

    public componentDidUpdate(prevProps: IS3RenderingViewProps) {
        this._GL.clearColor(this.props.backgroundColor[0], this.props.backgroundColor[1], this.props.backgroundColor[2], 1);
        if(prevProps.jsCode != this.props.jsCode || prevProps.viewType != this.props.viewType || prevProps.compileIndex != this.props.compileIndex) {
            this.setViewport();
            this.startUserProgram();
        } else if(prevProps.viewType != this.props.viewType || prevProps.width != this.props.width || prevProps.height != this.props.height) {
            this.setViewport();
            if(this._reRender) {
                this._reRender();
            }
        }
    }

    public componentWillUnmount() {
        this.stopUserProgram();
    }

    public printMessage(message: string) {
        this.state.messages.push(message);
        let maxMessages = 10;
        if(this.state.messages.length > maxMessages) {
            this.state.messages.splice(0, this.state.messages.length - maxMessages);
        }
        this.setState({
            messages: this.state.messages
        } as any);
    }
    public clearMessages() {
        this.setState({
            messages: []
        } as any);
    }

    public addControl(info: ControlInfo) {
        this.state.controls.push(info);
        this.setState({
            controls: this.state.controls
        } as any);
    }
    public updateControl(info: ControlInfo) {
        this.setState({
            controls: this.state.controls
        } as any);
    }
    public clearControls() {
        this.state.controls.splice(0, this.state.controls.length);
        this.setState({
            controls: this.state.controls
        } as any);
    }

    public startUserProgram() {
        this.clearMessages();
        this.clearControls();
        this.stopUserProgram();
        this.setViewport();
        let dataFile = this.props.dataFile;
        if(dataFile != null && dataFile != "") {
            if(dataFile.match(/\.csv$/i)) {
                d3.csv(dataFile, (err, data) => {
                    this.startUserProgramWithData(data);
                });
            }
            if(dataFile.match(/\.tsv$/i)) {
                d3.tsv(dataFile, (err, data) => {
                    this.startUserProgramWithData(data);
                });
            }
            if(dataFile.match(/\.json$/i)) {
                d3.json(dataFile, (err, data) => {
                    this.startUserProgramWithData(data);
                });
            }
        } else {
            this.startUserProgramWithData(null);
        }
    }

    public startUserProgramWithData(data: any) {
        let GL = this._GL;
        let D3 = d3;
        let addSlider = (name: string, shape: Stardust.Shape, attr: string, initial: number, min: number, max: number) => {
            shape.attr(attr, initial);
            let control: ControlInfoSlider = {
                type: "slider",
                name: name,
                value: initial,
                min: min,
                max: max,
                onChange: (val: number) => {
                    control.value = val;
                    shape.attr(attr, val);
                    this.updateControl(control);
                    this._reRender();
                }
            };
            this.addControl(control);
        };
        let userRender: () => any;
            let userAnimate: (t: number) => any = null;
            let userFinalize: () => any = null;
            let doRenderReal = () => {
                GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
                try {
                    if(userRender) userRender();
                } catch(e) {
                    this.printMessage(e.message);
                }
            }
            let doRender = () => {
                requestAnimationFrame(doRenderReal);
            };
            let runUserCode = () => {
                var render: any = undefined;
                var animate: any = undefined;
                var finalize: any = undefined;
                let DATA = data;
                let d3 = D3;
                let s3 = Stardust;
                (window as any)["d3"] = d3;
                (window as any)["Stardust"] = Stardust;
                (window as any)["platform"] = this._platform;
                let GL = this._GL;
                let svg = d3.select(this.refs.svg);
                let reRender = doRender;
                let print = (m: string) => this.printMessage(m);
                try {
                    eval(this.props.jsCode + "; userRender = render; userAnimate = animate; userFinalize = finalize;");
                } catch(e) {
                    this.printMessage(e.message);
                    this.printMessage(e.stack);
                }
            };
            runUserCode();
            doRender();
            let t0 = new Date().getTime();
            if(userAnimate) {
                this._timerCurrent = setInterval(() => {
                    let t = (new Date().getTime() - t0) / 1000;
                    userAnimate(t);
                    doRender();
                }, 10);
            }
            this._reRender = doRender;
            this._userCodeFinalize = userFinalize;
    }

    public onMouseDown(event: React.MouseEvent) {
        let pose0 = this._platform.pose;
        let x0 = event.screenX as number;
        let y0 = event.screenY as number;
        let onMouseMove = (e: MouseEvent) => {
            let x1 = e.screenX as number;
            let y1 = e.screenY as number;
            let dx = x1 - x0;
            let dy = y1 - y0;
            if(dx == 0 && dy == 0) {
                this._platform.setPose(pose0);
            } else {
                let len = Math.sqrt(dx * dx + dy * dy);
                let cq = Stardust.Quaternion.Rotation(new Stardust.Vector3(dy / len, dx / len, 0), -len / 100);
                let newPose = new Stardust.Pose(
                    pose0.rotation.rotate(cq.rotate(pose0.rotation.conj().rotate(pose0.position))),
                    pose0.rotation.mul(cq)
                );
                this._platform.setPose(newPose);
            }
            if(this._reRender) this._reRender();
        };
        let onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    public setViewport() {
        let platform = this._platform;
        let canvas = this.refs.canvas;
        let scale = 2;
        if(canvas.width != this.props.width * scale) {
            canvas.width = this.props.width * scale;
        }
        if(canvas.height != this.props.height * scale) {
            canvas.height = this.props.height * scale;
        }
        if(this.props.viewType == "3D") {
            platform.set3DView(Math.PI / 4, this.props.width / this.props.height, 0.1, 1000);
            platform.setPose(new Stardust.Pose(new Stardust.Vector3(0, 0, 500), new Stardust.Quaternion(0, 0, 0, 1)));
        } else {
            platform.set2DView(this.props.width, this.props.height);
            platform.setPose(new Stardust.Pose());
        }
        this._GL.viewport(0, 0, canvas.width, canvas.height);
    }

    public stopUserProgram() {
        if(this._timerCurrent) {
            clearInterval(this._timerCurrent);
            this._timerCurrent = null;
        }
        if(this._userCodeFinalize) {
            this._userCodeFinalize();
        }
        this._userCodeFinalize = null;
        this._reRender = null;
    }

    public renderControl(control: ControlInfo, index: number) {
        if(control.type == "slider") {
            let c = control as ControlInfoSlider;
            let cval = (c.value - c.min) / (c.max - c.min) * 1000;
            return (
                <div className="row" key={`c${index}`}>
                    <label>{c.name}</label>
                    <input type="range"
                        min={0} max={1000}
                        value={cval.toString()}
                        onChange={(e) => c.onChange(parseFloat((e.target as HTMLInputElement).value) / 1000 * (c.max - c.min) + c.min)}
                    />
                </div>
            );
        }
    }

    public render() {
        return (
            <div className="s3rendering-view" style={{ width: this.props.width + "px", height: this.props.height + "px" }}>
                <canvas ref="canvas" style={{ width: this.props.width + "px", height: this.props.height + "px" }} onMouseDown={ this.props.viewType == "3D" ? ((e) => this.onMouseDown(e)) : null} />
                <svg ref="svg" style={{ width: this.props.width + "px", height: this.props.height + "px" }} />
                <div className="overlay">
                    <div className="messages">
                    { this.state.messages.map((m, index) => <pre key={`m${index}`}>{m}</pre>) }
                    </div>
                    <div className="controls">
                    { this.state.controls.map((c, index) => this.renderControl(c, index)) }
                    </div>
                </div>
            </div>
        );
    }
}
