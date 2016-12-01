import { IUserCodeConfig } from "./context";



export class WebVRContext {
    private _config: IUserCodeConfig;

    constructor(config: IUserCodeConfig) {
        this._config = config;
    }

    public generateHTML(): string {
        return `
            <!DOCTYPE html>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
            <meta name="mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <style>
                html, body {
                width: 100%;
                height: 100%;
                background-color: #000;
                color: #fff;
                margin: 0px;
                padding: 0;
                overflow: hidden;
                }
                canvas {
                position: absolute;
                top: 0;
                }
            </style>
            <canvas id="main-canvas" />
            <script type="text/javascript">
                WebVRConfig = {
                BUFFER_SCALE: 1.0,
                };
            </script>
            <script type="text/javascript" src="/webvr-polyfill.js"></script>
            <script src="//d3js.org/d3.v3.min.js" type="text/javascript"></script>
            <script type="text/javascript" src="//stardust-vis.github.io/stardust/stardust.bundle.min.js"></script>
            <script type="text/javascript">
                let DATA = ${JSON.stringify(this._config.data)};
                let UserCodeInfo = {};
                function UserCode(platform) {
                    "use strict";
                    ${this._config.code}
                    if(typeof(render) != "undefined") UserCodeInfo.render = render;
                    if(typeof(animate) != "undefined") UserCodeInfo.animate = animate;
                }
            </script>
            <script type="text/javascript">
                let canvas = document.getElementById("main-canvas");
                canvas.getContext("webgl", { alpha: false });
                let width = window.innerWidth;
                let height = window.innerHeight;
                let platform = Stardust.platform("webgl-webvr", canvas, width, height);
                platform.pixelRatio = 0.5;
                platform.setPose(new Stardust.Pose(new Stardust.Vector3(0, 0, 500), new Stardust.Quaternion(0, 0, 0, 1)));

                UserCode(platform);
                navigator.getVRDisplays().then((displays) => {
                    let vrDisplay = displays[0];

                    function onResize() {
                        if(vrDisplay && vrDisplay.isPresenting) {
                            // If we're presenting we want to use the drawing buffer size
                            // recommended by the VRDevice, since that will ensure the best
                            // results post-distortion.
                            var leftEye = vrDisplay.getEyeParameters("left");
                            var rightEye = vrDisplay.getEyeParameters("right");
                            // For simplicity we're going to render both eyes at the same size,
                            // even if one eye needs less resolution. You can render each eye at
                            // the exact size it needs, but you'll need to adjust the viewports to
                            // account for that.
                            platform.resize(Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2, Math.max(leftEye.renderHeight, rightEye.renderHeight));
                        } else {
                            platform.resize(window.innerWidth, window.innerHeight);
                        }
                    }
                    function onVRDisplayPresentChange() {
                        onResize();
                    }

                    window.addEventListener("resize", onResize, false);
                    window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

                    let frameData = new VRFrameData();

                    let time0 = new Date().getTime();

                    function onAnimationFrame() {
                        if (vrDisplay.isPresenting) {
                            platform.clear([ 0, 0, 0, 1 ]);

                            let time1 = new Date().getTime();
                            let t = (time1 - time0) / 1000;

                            if(UserCodeInfo.animate) UserCodeInfo.animate(t);

                            vrDisplay.getFrameData(frameData);

                            // When presenting render a stereo view.
                            platform._GL.viewport(0, 0, canvas.width * 0.5, canvas.height);
                            platform.setWebVRView(frameData.leftViewMatrix, frameData.leftProjectionMatrix);
                            if(UserCodeInfo.render) UserCodeInfo.render();

                            platform._GL.viewport(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);
                            platform.setWebVRView(frameData.rightViewMatrix, frameData.rightProjectionMatrix);
                            if(UserCodeInfo.render) UserCodeInfo.render();
                            // If we're currently presenting to the VRDisplay we need to
                            // explicitly indicate we're done rendering.
                            vrDisplay.submitFrame();
                        }
                        vrDisplay.requestAnimationFrame(onAnimationFrame);
                    }
                    vrDisplay.requestAnimationFrame(onAnimationFrame);

                    canvas.onclick = () => {
                        vrDisplay.requestPresent([{ source: canvas }]).catch((err) => {
                            document.body.innerHTML = err;
                        });
                    };
                });
            </script>
        `
    }
}