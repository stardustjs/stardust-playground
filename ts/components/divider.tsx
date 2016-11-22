import * as React from "react";
import * as ReactDom from "react-dom";
import * as d3 from "d3";

export class VerticalDivider extends React.Component<{
    left: number
    onDrag: (newLeft: number) => void
}, {}> {

    public onMouseDown(event: React.MouseEvent) {
        let x0 = event.screenX;
        let l0 = this.props.left;
        let onMouseMove = (event: MouseEvent) => {
            let x1 = event.screenX;
            this.props.onDrag(l0 + x1 - x0);
        }
        let onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            d3.selectAll("iframe").style("pointer-events", "auto");
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        d3.selectAll("iframe").style("pointer-events", "none");
    }

    public render() {
        return <div className="v-divider" style={{ left: this.props.left + "px" }} onMouseDown={(event) => this.onMouseDown(event)}></div>;
    }
}

export class HorizontalDivider extends React.Component<{
    top: number
    onDrag: (newtop: number) => void
}, {}> {

    public onMouseDown(event: React.MouseEvent) {
        let y0 = event.screenY;
        let t0 = this.props.top;
        let onMouseMove = (event: MouseEvent) => {
            let y1 = event.screenY;
            this.props.onDrag(t0 + y1 - y0);
        }
        let onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            d3.selectAll("iframe").style("pointer-events", "auto");
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        d3.selectAll("iframe").style("pointer-events", "none");
    }

    public render() {
        return <div className="h-divider" style={{ top: this.props.top + "px" }} onMouseDown={(event) => this.onMouseDown(event)}></div>;
    }
}