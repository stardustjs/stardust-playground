/// <reference path="./allofw.d.ts" />

import * as vm from "vm";
import * as fs from "fs";
import * as d3 from "d3";
import * as Stardust from "stardust-core";
import * as StardustAllofw from "stardust-allofw";

import { Context, IUserCodeConfig } from "./context";

let allofwutils = require("allofwutils");

export function Simulator(app: any) {
    app.server.on("run", (config: IUserCodeConfig) => {
        app.networking.broadcast("run", config);
    });
    app.server.on("stop", () => {
        app.networking.broadcast("stop");
    });

    // Periodically sync time.
    var time_start = new Date().getTime() / 1000;
    var GetCurrentTime = function() {
        return new Date().getTime() / 1000 - time_start;
    };
    setInterval(function() {
        app.networking.broadcast("time", GetCurrentTime());
        app.networking.broadcast("animate", GetCurrentTime());
    }, 1000.0 / 60.0);
}

export function Renderer(app: any) {
    let GL = app.GL;
    let omni = app.omni;
    let window = app.window;

    let context: Context = null;

    app.navigation.setHomePosition(new allofwutils.math.Vector3(0, 0, 200));
    app.navigation.setHomeRotation(new allofwutils.math.Quaternion(new allofwutils.math.Vector3(0, 0, 0), 1));
    app.navigation.setPosition(new allofwutils.math.Vector3(0, 0, 200));
    app.navigation.setRotation(new allofwutils.math.Quaternion(new allofwutils.math.Vector3(0, 0, 0), 1));

    omni.setLens(6.5, 500);
    omni.setClipRange(0.1, 1000);

    let platform = new StardustAllofw.AllofwPlatform3D(window, omni);

    // Time sync.
    var time_diff = 0;
    var time_start = 0;
    app.networking.on("time", (time: number) => {
        time_diff = time - new Date().getTime() / 1000;
    });
    var GetCurrentTime = () => {
        return new Date().getTime() / 1000 + time_diff;
    };

    app.networking.on("stop", () => {
        context = null;
    });

    app.networking.on("run", (config: IUserCodeConfig) => {
        context = new Context(config, platform);
        context.start();
        context.setup();
    });

    app.networking.on("animate", (t: number) => {
        if(context) {
            context.animate(t);
        }
    });

    this.render = () => {
        GL.enable(GL.BLEND);
        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        if(context) {
            context.render();
        }
    };
}

exports.renderer = Renderer;
exports.simulator = Simulator;