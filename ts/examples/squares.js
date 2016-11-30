/// name: Squares
/// type: 2D
/// data: data/mnist.csv

var marks = Stardust.mark.compile(`
    import Rectangle, OutlinedRectangle from P2D;

    let size: float = 2;
    let spacing: float = 3;
    let x0: float = 10;
    let xSpacing: float = 85;
    let y1: float = 700;
    let binSpacing: float = 47;

    let CMsp: float = 1.6;
    let CMspacing: float = 55;
    let CMx0: float = 50;
    let CMy0: float = 110;

    let t: float = 0;

    let binIx: float;
    let binIy: float;
    let CMIx: float;
    let CMIy: float;
    let CMwh: float;
    let bin: float;
    let assigned: float;
    let label: float;
    let color: Color;

    mark BinnedSquare() {
        let x = x0 + xSpacing * assigned;
        let y = y1 - bin * binSpacing;
        let bx = binIx * spacing;
        let by = binIy * spacing;
        x = x + bx;
        y = y + by;
        let p1a = Vector2(x, y);
        let p2a = Vector2(x + size, y + size);
        let CMx = CMx0 + assigned * CMspacing;
        let CMy = CMy0 + label * CMspacing;
        let dx = CMsp * CMIx;
        let dy = CMsp * CMIy;
        CMx = CMx + dx - CMwh / 2 * CMsp;
        CMy = CMy + dy - CMwh / 2 * CMsp;
        let p1b = Vector2(CMx, CMy);
        let p2b = Vector2(CMx + size, CMy + size);
        Rectangle(p1a * (1 - t) + p1b * t, p2a * (1 - t) + p2b * t, color);
    }

    mark BinnedOutlinedSquare() {
        let x = x0 + xSpacing * label;
        let y = y1 - bin * binSpacing;
        let bx = binIx * spacing;
        let by = binIy * spacing;
        x = x - bx - spacing;
        y = y + by;
        let p1a = Vector2(x, y);
        let p2a = Vector2(x + size, y + size);
        let CMx = CMx0 + assigned * CMspacing;
        let CMy = CMy0 + label * CMspacing;
        let dx = CMsp * CMIx;
        let dy = CMsp * CMIy;
        CMx = CMx + dx - CMwh / 2 * CMsp;
        CMy = CMy + dy - CMwh / 2 * CMsp;
        let p1b = Vector2(CMx, CMy);
        let p2b = Vector2(CMx + size, CMy + size);
        OutlinedRectangle(p1a * (1 - t) + p1b * t, p2a * (1 - t) + p2b * t, 0.5, color);
    }
`);

var Nbins = 15;
var Nclasses = 10;
var CM = [];
var CMBin = [];

var instances = DATA.map(function(d) {
    return {
        label: parseInt(d.Label.substr(1)),
        assigned: parseInt(d.Assigned.substr(1)),
        score: d[d.Assigned],
        scoreBin: Math.min(Nbins - 1, Math.max(0, Math.floor(parseFloat(d[d.Assigned]) * Nbins)))
    };
});

for(var i = 0; i < Nclasses; i++) {
    CM[i] = [];
    CMBin[i] = [];
    for(var j = 0; j < Nclasses; j++) {
        CM[i][j] = 0;
        CMBin[i][j] = [];
        for(var k = 0; k < Nbins; k++) {
            CMBin[i][j][k] = 0;
        }
    }
}

instances.sort(function(a, b) {
    if(a.label == a.assigned) return b.label == b.assigned ? 0 : +1;
    if(b.label == b.assigned) return a.label == a.assigned ? 0 : -1;
    if(a.assigned != b.assigned)
        return a.assigned - b.assigned;
    if(a.label != b.label)
        return a.label - b.label;
    return a.score - b.score;
})

instances.forEach(function(d) {
    d.CMIndex = CM[d.label][d.assigned];
    CM[d.label][d.assigned] += 1;
    d.binIndex = CMBin[0][d.assigned][d.scoreBin];
    CMBin[0][d.assigned][d.scoreBin] += 1;
});

instances.sort(function(a, b) {
    if(a.label == a.assigned) return b.label == b.assigned ? 0 : +1;
    if(b.label == b.assigned) return a.label == a.assigned ? 0 : -1;
    if(a.assigned != b.assigned)
        return -(a.assigned - b.assigned);
    if(a.label != b.label)
        return a.label - b.label;
    return a.score - b.score;
})

instances.forEach(function(d) {
    d.binIndex2 = CMBin[1][d.label][d.scoreBin];
    CMBin[1][d.label][d.scoreBin] += 1;
});

instances.forEach(function(d) {
    d.CMCount = CM[d.label][d.assigned];
});

var colors = [[31,119,180],[255,127,14],[44,160,44],[214,39,40],[148,103,189],[140,86,75],[227,119,194],[127,127,127],[188,189,34],[23,190,207]];
colors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 1 ]);

var mark = Stardust.mark.create(marks.BinnedSquare, platform);
mark.attr("color", (d) => colors[d.label]);
mark.attr("label", (d) => d.label);
mark.attr("assigned", (d) => d.assigned);
mark.attr("binIx", (d) => Math.floor(d.binIndex / 15));
mark.attr("binIy", (d) => d.binIndex % 15);
mark.attr("CMwh", (d) => Math.ceil(Math.sqrt(d.CMCount)));
mark.attr("CMIx", (d) => Math.floor(d.CMIndex / mark.attr("CMwh")(d)));
mark.attr("CMIy", (d) => d.CMIndex % mark.attr("CMwh")(d));
mark.attr("bin", (d) => d.scoreBin);

var mark2 = Stardust.mark.create(marks.BinnedOutlinedSquare, platform);
mark2.attr("color", (d) => colors[d.assigned]);
mark2.attr("label", (d) => d.label);
mark2.attr("assigned", (d) => d.assigned);
mark2.attr("binIx", (d) => Math.floor(d.binIndex2 / 15));
mark2.attr("binIy", (d) => d.binIndex2 % 15);
mark2.attr("CMwh", (d) => Math.ceil(Math.sqrt(d.CMCount)));
mark2.attr("CMIx", (d) => Math.floor(d.CMIndex / mark2.attr("CMwh")(d)));
mark2.attr("CMIy", (d) => d.CMIndex % mark2.attr("CMwh")(d));
mark2.attr("bin", (d) => d.scoreBin);

addSlider("t", mark, "t", 0, 0, 1);

mark.data(instances);
mark2.data(instances.filter((d) => d.label != d.assigned));

function render() {
    mark2.attr("t", mark.attr("t"));
    mark2.render();
    mark.render();
}