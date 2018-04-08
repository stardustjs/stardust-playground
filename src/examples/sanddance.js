/// name: SandDance
/// type: 3D
/// data: data/demovoteclean.tsv
/// background: [ 0, 0, 0, 1 ]

let demovote = DATA;

let mark = Stardust.mark.compile(`
    import { Cube } from P3D;

    let longitude: float;
    let latitude: float;
    let state: float;
    let stateBinIndex: float;
    let xBin: float;
    let yBin: float;
    let xyBinIndex: float;
    let index: float;

    function getPositionScatterplot(): Vector3 {
        let scaleX = 0.15;
        let scaleY = 0.22;
        return Vector3(
            scaleX * (longitude - (-95.9386152570054)),
            scaleY * (latitude - (37.139536624928695)),
            0
        );
    }

    function getPositionStateBins(): Vector3 {
        return Vector3(
            (state - 48 / 2) * 0.2 + (stateBinIndex % 10 - 4.5) * 0.012,
            floor(stateBinIndex / 10) * 0.012 - 1.0, 0
        );
    }

    function getPositionXYBinning(): Vector3 {
        let n = 5;
        let txy = xyBinIndex % (n * n);
        let tx = txy % n;
        let ty = floor(txy / n);
        let tz = floor(xyBinIndex / (n * n));
        return Vector3(
            (xBin - 9 / 2) * 0.6 + (tx - n / 2 + 0.5) * 0.02,
            tz * 0.02 - 2.0,
            (yBin - 6 / 2) * 0.6 + (ty - n / 2 + 0.5) * 0.02
        );
    }

    function clamp01(t: float): float {
        if(t < 0) t = 0;
        if(t > 1) t = 1;
        return t;
    }

    mark Mark(color: Color, t1: float, t2: float, t3: float, ki1: float, ki2: float, ki3: float) {
        let p1 = getPositionScatterplot();
        let p2 = getPositionStateBins();
        let p3 = getPositionXYBinning();
        let p = p1 * clamp01(t1 + ki1 * index) +
            p2 * clamp01(t2 + ki2 * index) +
            p3 * clamp01(t3 + ki3 * index);
        Cube(
            p * 50,
            0.25,
            color
        );
    }
`)["Mark"];
let marks = Stardust.mark.create(mark, platform);

demovote.forEach(d => {
    d.Longitude = +d.Longitude;
    d.Latitude = +d.Latitude;
});

let longitudeExtent = d3.extent(demovote, d => d.Longitude);
let latitudeExtent = d3.extent(demovote, d => d.Latitude);

let longitudeScale = d3.scaleLinear().domain(longitudeExtent).range([0, 1])
let latitudeScale = d3.scaleLinear().domain(latitudeExtent).range([0, 1])

// Map states to integer.
let states = new Set();
let state2number = {};
let state2count = {};
demovote.forEach(d => states.add(d.StateAbb));
states = Array.from(states);
states.sort();
states.forEach((d, i) => {
    state2number[d] = i;
    state2count[d] = 0;
});

let xyBinCounter = {};

let xBinCount = 10;
let yBinCount = 7;

demovote.sort((a, b) => a.Obama - b.Obama);
demovote.forEach((d, i) => {
    d.index = i;
    if (state2count[d.StateAbb] == null) state2count[d.StateAbb] = 0;
    d.stateBinIndex = state2count[d.StateAbb]++;

    let xBin = Math.floor(longitudeScale(d.Longitude) * xBinCount);
    let yBin = Math.floor(latitudeScale(d.Latitude) * yBinCount);
    let bin = yBin * (xBinCount + 1) + xBin;
    d.xBin = xBin;
    d.yBin = yBin;
    if (xyBinCounter[bin] == null) xyBinCounter[bin] = 0;
    d.xyBinIndex = xyBinCounter[bin]++;
});


let s1 = d3.interpolateLab("#f7f7f7", "#0571b0");
let s2 = d3.interpolateLab("#f7f7f7", "#ca0020");

let strToRGBA = (str) => {
    let rgb = d3.rgb(str);
    return [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1];
}

let scaleColor = (value) => {
    if (value > 0.5) {
        return strToRGBA(s1((value - 0.5) * 2));
    } else {
        return strToRGBA(s2((0.5 - value) * 2));
    }
}

marks
    .attr("index", d => d.index / (demovote.length - 1))
    .attr("longitude", d => d.Longitude)
    .attr("latitude", d => d.Latitude)
    .attr("state", (d) => state2number[d.StateAbb])
    .attr("stateBinIndex", (d) => d.stateBinIndex)
    .attr("xBin", (d) => d.xBin)
    .attr("yBin", (d) => d.yBin)
    .attr("xyBinIndex", (d) => d.xyBinIndex)
    .attr("color", (d) => scaleColor(d.Obama));

function setT(t) {
    if (t >= 0 && t <= 1) {
        let tt = t * 1.3 - 0.3;
        marks.attr("t1", 1 - tt).attr("t2", tt).attr("t3", 0).attr("ki1", -0.3).attr("ki2", +0.3).attr("ki3", 0);
    } else if (t >= 1 && t <= 2) {
        marks.attr("t1", 0).attr("t2", 1).attr("t3", 0).attr("ki1", 0).attr("ki2", 0).attr("ki3", 0);
    } else if (t >= 2 && t <= 3) {
        let tt = (t - 2) * 1.3 - 0.3;
        marks.attr("t1", 0).attr("t2", 1 - tt).attr("t3", tt).attr("ki1", 0).attr("ki2", -0.3).attr("ki3", +0.3);
    } else if (t >= 3 && t <= 4) {
        marks.attr("t1", 0).attr("t2", 0).attr("t3", 1).attr("ki1", 0).attr("ki2", 0).attr("ki3", 0);
    } else if (t >= 4 && t <= 5) {
        let tt = (t - 4) * 1.3 - 0.3;
        marks.attr("t1", tt).attr("t2", 0).attr("t3", 1 - tt).attr("ki1", +0.3).attr("ki2", 0).attr("ki3", -0.3);
    } else {
        marks.attr("t1", 1).attr("t2", 0).attr("t3", 0).attr("ki1", 0).attr("ki2", 0).attr("ki3", 0);
    }
}

marks.data(demovote);

function render() {
    marks.render();
}

function animate(t) {
    t = t % 6;
    setT(t);
}