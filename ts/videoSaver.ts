import * as d3 from "d3";

export class VideoSaver {
    _frameIndex: number = 0;
    _url: string;

    constructor(url: string, fps: number) {
        this._url = url;
        d3.xhr(this._url).header("content-type", "application/json").post(JSON.stringify({
            type: "init",
            fps: fps
        }), (err, data) => {
        });
    }

    public add(dataurl: string) {
        d3.xhr(this._url).header("content-type", "application/json").post(JSON.stringify({
            type: "frame",
            index: this._frameIndex,
            dataurl: dataurl
        }), (err, data) => {
        });
        this._frameIndex += 1;
    }

    public end() {
        d3.xhr(this._url).header("content-type", "application/json").post(JSON.stringify({
            type: "end"
        }), (err, data) => {
        });
    }
}