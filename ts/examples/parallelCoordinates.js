/// name: Parallel Coordinates
/// type: 2D
/// data: data/mnist.csv

var marks = Stardust.mark.compile(`
    import Triangle from P2D;

    mark PCLine(
        p1: Vector2,
        p2: Vector2,
        width: float,
        color: Color
    ) {
        let w2 = width / (p1.x - p2.x) * (p1.y - p2.y);
        let s = sqrt(width * width + w2 * w2) / 2;
        let m1 = Vector2(p1.x, p1.y + s);
        let m2 = Vector2(p1.x, p1.y - s);
        let n1 = Vector2(p2.x, p2.y + s);
        let n2 = Vector2(p2.x, p2.y - s);
        Triangle(m1, m2, n1, color);
        Triangle(m2, n2, n1, color);
    }

    mark PC(
        x0: float, x1: float, x2: float,
        y0: float, y1: float, y2: float,
        alpha: float,
        color: Color
    ) {
        PCLine(Vector2(x0, y0), Vector2(x1, y1), 1, color);
        PCLine(Vector2(x1, y1), Vector2(x2, y2), 1, color);
    }
`);

var mark = Stardust.mark.create(marks.PC, platform);

var instances = DATA.map(function(d) {
    return {
        C0: +d.C0, C1: +d.C1, C2: +d.C2, C3: +d.C3, C4: +d.C4,
        C5: +d.C5, C6: +d.C6, C7: +d.C7, C8: +d.C8, C9: +d.C9,
        assigned: parseInt(d.Assigned.substr(1))
    };
});

var colors = [[31,119,180],[255,127,14],[44,160,44],[214,39,40],[148,103,189],[140,86,75],[227,119,194],[127,127,127],[188,189,34],[23,190,207]];
colors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 0.1 ]);

var mY = Stardust.scale.log().domain([ 0.01, 1 ]).range([ 500, 100 ]);

var xScale = d3.scale.linear().domain([ 0, 2 ]).range([ 100, 700 ]);
mark.attr("y0", mY((d) => d.C0)).attr("x0", xScale(0));
mark.attr("y1", mY((d) => d.C1)).attr("x1", xScale(1));
mark.attr("y2", mY((d) => d.C2)).attr("x2", xScale(2));
mark.attr("color", (d) => colors[d.assigned]);
mark.data(instances);

addSlider("Alpha", mark, "alpha", 0.02, 0, 0.1);

function render() {
    mark.render();
}