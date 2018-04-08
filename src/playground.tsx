import * as React from "react";
import * as ReactDom from "react-dom";
import * as Actions from "./actions";
import * as d3 from "d3";

// Components.
import { S3RenderingView } from "./components/s3renderingIFrame";
import { MonacoEditor } from "./components/editor";
import { HorizontalDivider, VerticalDivider } from "./components/divider";

import { examples } from "./examples";

function getCSSColor(color: number[]): string {
    let r = (color[0] * 255).toString(16);
    while (r.length < 2) r = "0" + r;
    let g = (color[1] * 255).toString(16);
    while (g.length < 2) g = "0" + g;
    let b = (color[2] * 255).toString(16);
    while (b.length < 2) b = "0" + b;
    return "#" + r + g + b;
}

function parseCSSColor(str: string): number[] {
    let rgb = d3.rgb(str);
    return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}

export class ToolbarView extends React.Component<{}, {}> {
    refs: {
        [name: string]: Element;
        selectExample: HTMLSelectElement;
    }

    public render() {
        return (
            <div className="toolbar">
                <span className="title"><a href="https://stardust-vis.github.io/">Stardust</a> Playground</span>
                {"Load example: "}
                <select ref="selectExample" onChange={(event) => new Actions.LoadExample(this.refs.selectExample.value).dispatch()}>
                    {examples.map((example, index) => <option key={index} value={example.name}>{example.name}</option>)}
                </select>
                {" "}
                <button onClick={(event) => new Actions.Compile().dispatch()}>Run</button>
            </div>
        );
    }
}

export interface IPlaygroundState {
    viewType: "2D" | "3D";
    dataFile: string;
    jsCode: string;
    backgroundColor: number[];

    width: number;
    height: number;

    panelWidth: number;

    compiled: {
        viewType: "2D" | "3D";
        backgroundColor: number[];
        dataFile: string;
        jsCode: string;
        compileIndex: string;
    }
}

export class PlaygroundRootView extends React.Component<{}, IPlaygroundState> {
    refs: {
        [name: string]: Element | MonacoEditor;
        jsCodeEditor: MonacoEditor;
        inputDataFile: HTMLInputElement;
        input3D: HTMLInputElement;
        inputColor: HTMLInputElement;
    }
    constructor(props: {}) {
        super(props);
        this.state = {
            viewType: "2D",
            dataFile: "",
            jsCode: "",
            backgroundColor: [1, 1, 1],
            compiled: null,
            width: window.innerWidth,
            height: window.innerHeight,
            panelWidth: 400
        };
    }

    private onResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight
        } as any);
    }

    public componentDidMount() {
        Actions.GlobalDispatcher.register((action) => {
            if (action instanceof Actions.LoadExample) {
                let example = examples.filter(e => e.name == action.exampleName)[0];
                if (!example) return;
                this.setState({
                    dataFile: example.dataFile,
                    viewType: example.viewType,
                    jsCode: example.jsCode,
                    backgroundColor: example.background,
                    compiled: {
                        dataFile: example.dataFile,
                        viewType: example.viewType,
                        backgroundColor: example.background,
                        jsCode: example.jsCode,
                        compileIndex: new Date().getTime()
                    }
                } as any);
            }
            if (action instanceof Actions.Compile) {
                this.setState({
                    compiled: {
                        dataFile: this.state.dataFile,
                        viewType: this.state.viewType,
                        backgroundColor: this.state.backgroundColor,
                        jsCode: this.state.jsCode,
                        compileIndex: new Date().getTime()
                    }
                } as any);
            }
        });

        window.addEventListener("resize", this.onResize.bind(this));

        setTimeout(() => {
            new Actions.LoadExample(examples[0].name).dispatch();
        }, 1);
    }

    public render() {
        return (
            <div>
                <ToolbarView />
                <div className="editor-panel" style={{ width: this.state.panelWidth + "px" }}>
                    <div className="row">
                        Data file: <input ref="inputDataFile" type="text" value={this.state.dataFile} onChange={(event) => this.setState({ dataFile: this.refs.inputDataFile.value } as any)} />
                    </div>
                    <div className="row">
                        3D: <input ref="input3D" type="checkbox" checked={this.state.viewType == "3D"} onChange={(event) => this.setState({ viewType: this.refs.input3D.checked ? "3D" : "2D" } as any)} />
                        {" "}
                        Background: <input ref="inputColor" type="color" value={getCSSColor(this.state.backgroundColor)} onChange={(event) => this.setState({ backgroundColor: parseCSSColor(this.refs.inputColor.value) } as any)} />
                    </div>
                    <div className="editors">
                        <div className="editor" style={{ top: 0, bottom: 0 }}>
                            <MonacoEditor
                                ref="jsCodeEditor"
                                value={this.state.jsCode}
                                language={"javascript"}
                                onChange={(value) => this.setState({ jsCode: value } as any)}
                            />
                        </div>
                    </div>
                </div>
                <VerticalDivider left={this.state.panelWidth} onDrag={(newLeft) => this.setState({ panelWidth: Math.min(this.state.width - 30, Math.max(30, newLeft)) } as any)} />
                <div className="s3rendering-container" style={{ left: this.state.panelWidth + 5 + "px" }}>
                    {this.state.compiled ? <S3RenderingView
                        dataFile={this.state.compiled.dataFile}
                        viewType={this.state.compiled.viewType}
                        jsCode={this.state.compiled.jsCode}
                        width={this.state.width - 5 - this.state.panelWidth}
                        height={this.state.height - 30}
                        compileIndex={this.state.compiled.compileIndex}
                        backgroundColor={this.state.compiled.backgroundColor}
                    /> : null}
                </div>
            </div>
        );
    }
}

(window as any)["playgroundInitialize"] = () => {
    console.log("Initialize");
    ReactDom.render(<PlaygroundRootView />, document.getElementById("root"));
}