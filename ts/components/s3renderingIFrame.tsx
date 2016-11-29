import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as d3 from "d3";

import * as protocol from "../runtime/protocol";

let iFrameHTMLTemplate = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8" />
            <style type="text/css">
            body { margin: 0; padding: 0; }
            canvas { margin: 0; padding: 0; position: absolute; left: 0; top: 0; }
            svg { margin: 0; padding: 0; position: absolute; left: 0; top: 0; }
            </style>
        </head>
        <body>
            <script type="text/javascript" src="_USER_CODE_DATAURL_"></script>
            <script type="text/javascript" src="runtime/iframe-webgl.js"></script>
        </body>
    </html>
`;

export interface IS3RenderingViewProps {
    dataFile: string;
    viewType: "2D" | "3D";
    backgroundColor: number[];
    jsCode: string;
    compileIndex?: string;

    width: number;
    height: number;
}

export interface IS3RenderingViewState {
    iFrameInnerHTML: string;
    compileIndex: string;
}

export interface IS3OverlayViewProps {
    parent: S3RenderingView;
}

export interface IS3OverlayViewState {
    messages: protocol.IMessageInfo[];
    controls: protocol.IControlInfo[];
}

export class S3OverlayView extends React.Component<IS3OverlayViewProps, IS3OverlayViewState> {
    constructor(props: IS3OverlayViewProps) {
        super(props);
        this.state = {
            messages: [],
            controls: []
        };
        this.onMessage = this.onMessage.bind(this);
    }

    public reset() {
        this.setState({
            messages: [],
            controls: []
        });
    }

    private componentDidMount() {
        window.addEventListener("message", this.onMessage);
    }

    private componentWillUnmount() {
        window.removeEventListener("message", this.onMessage);
    }

    private onMessage(e: MessageEvent) {
        if(e.source == this.props.parent.refs.frame.contentWindow) {
            let msg = e.data as protocol.IFrameMessage;
            switch(msg.type) {
                case "message": {
                    this.state.messages.push(msg.message);
                    let maxMessages = 10;
                    if(this.state.messages.length > maxMessages) {
                        this.state.messages.splice(0, this.state.messages.length - maxMessages);
                    }
                    this.setState({
                        messages: this.state.messages
                    } as any);
                } break;
                case "control.add": {
                    this.state.controls.push(msg.control);
                    this.setState({
                        controls: this.state.controls
                    } as any);
                } break;
            }
        }
    }

    private postMessage(msg: protocol.IFrameMessage) {
        this.props.parent.refs.frame.contentWindow.postMessage(msg, "*");
    }

    public renderControl(control: protocol.IControlInfo, index: number) {
        switch(control.type) {
            case "slider": {
                let cval = ((control.value as number) - control.min) / (control.max - control.min) * 1000;
                return (
                    <div className="row" key={`c${index}`}>
                        <label>{control.name}</label>
                        <input type="range"
                            min={0} max={1000}
                            value={cval.toString()}
                            onChange={(e) => {
                                control.value = parseFloat((e.target as HTMLInputElement).value) / 1000 * (control.max - control.min) + control.min;
                                this.setState({
                                    controls: this.state.controls
                                } as any);
                                this.postMessage({
                                    type: "control.event",
                                    controlEvent: {
                                        name: control.name,
                                        value: control.value
                                    }
                                });
                            }}
                        />
                    </div>
                );
            }
        }
    }

    public render() {
        return (
            <div className="overlay">
                <div className="messages">
                { this.state.messages.map((m, index) => <pre key={`m${index}`} className={`message-${m.type}`}>{m.message}</pre>) }
                </div>
                <div className="controls">
                { this.state.controls.map((c, index) => this.renderControl(c, index)) }
                </div>
            </div>
        );
    }
}

export class S3RenderingView extends React.Component<IS3RenderingViewProps, IS3RenderingViewState> {
    refs: {
        [ name: string ]: any,
        frame: HTMLIFrameElement,
        overlay: S3OverlayView
    }

    constructor(props: IS3RenderingViewProps) {
        super(props);
        this.state = {
            iFrameInnerHTML: "",
            compileIndex: ""
        }
    };

    private toDataURL(code: string, type: string) {
        return `data:${type};base64,${btoa(code)}`;
    }

    public componentWillMount() {
        this.updateInnerHTML(this.props);
    }

    public componentWillReceiveProps(nextProps: IS3RenderingViewProps) {
        if(
            this.props.viewType != nextProps.viewType ||
            this.props.dataFile != nextProps.dataFile ||
            this.props.backgroundColor != nextProps.backgroundColor ||
            this.props.jsCode != nextProps.jsCode ||
            this.props.compileIndex != nextProps.compileIndex
        ) {
            this.updateInnerHTML(nextProps);
        }
    }

    public updateInnerHTML(props: IS3RenderingViewProps) {
        let config = {
            dataFile: props.dataFile,
            backgroundColor: props.backgroundColor,
            compileIndex: props.compileIndex,
            viewType: props.viewType
        };
        let methodNames = [ "render", "animate", "setup" ];
        let userCode = `
            let UserCodeConfig = ${JSON.stringify(config)};
            let UserCodeExports = {};
            function UserCode() {
                ${props.jsCode}
                ${methodNames.map(name => {
                    return `
                        if(typeof(${name}) != "undefined" && ${name} != null) {
                            UserCodeExports.${name} = ${name};
                        }
                    `;
                }).join("\n")}
            }
        `;
        let innerHTML = iFrameHTMLTemplate.replace("_USER_CODE_DATAURL_", this.toDataURL(userCode, "text/javascript"));
        if(this.state.iFrameInnerHTML != innerHTML) {
            if(this.refs.overlay) this.refs.overlay.reset();
            this.setState({
                iFrameInnerHTML: innerHTML,
                compileIndex: props.compileIndex
            });
        }
    }

    public shouldComponentUpdate(nextProps: IS3RenderingViewProps, nextState: {}) {
        if(
            this.props.width != nextProps.width ||
            this.props.height != nextProps.height ||
            this.props.viewType != nextProps.viewType ||
            this.props.dataFile != nextProps.dataFile ||
            this.props.backgroundColor != nextProps.backgroundColor ||
            this.props.jsCode != nextProps.jsCode ||
            this.props.compileIndex != nextProps.compileIndex
        ) return true;
        return false;
    }

    public render() {
        return (
            <div className="s3rendering-view" style={{ width: this.props.width + "px", height: this.props.height + "px" }}>
                {[<iframe
                    ref="frame"
                    key={`k${this.state.compileIndex}`}
                    srcDoc={this.state.iFrameInnerHTML}
                    width={this.props.width}
                    height={this.props.height}
                    style={{
                        border: "none"
                    }}
                />]}
                <S3OverlayView ref="overlay" parent={this} />
            </div>
        );
    }
}
