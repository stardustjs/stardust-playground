/// name: Parallel Coordinates (Polylines)
/// type: 2D
/// data: data/mnist.csv

var polyline = Stardust.shape.polyline();
var shape = Stardust.shape.create(polyline, platform);

var instances = DATA.map(function(d) {
    return {
        C0: +d.C0, C1: +d.C1, C2: +d.C2, C3: +d.C3, C4: +d.C4,
        C5: +d.C5, C6: +d.C6, C7: +d.C7, C8: +d.C8, C9: +d.C9,
        assigned: parseInt(d.Assigned.substr(1))
    };
});

var colors = [[31,119,180],[255,127,14],[44,160,44],[214,39,40],[148,103,189],[140,86,75],[227,119,194],[127,127,127],[188,189,34],[23,190,207]];
colors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 0.5 ]);

var yScale = Stardust.scale.linear().domain([ 0, 1 ]).range([ 500, 100 ]);
var xScale = Stardust.scale.linear().domain([ 0, 9 ]).range([ 100, 700 ]);

shape.attr("p", Stardust.scale.Vector2(
    xScale(d => d[0]),
    yScale(d => d[1])
));
shape.attr("width", 1);
shape.attr("color", [ 0, 0, 0, 1 ]);

let indices = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
let convertInstance = (inst) => indices.map(i => [i, inst["C" + i]]);

shape.instance((d) => {
    return {
        data: convertInstance(d),
        attrs: {
            color: colors[d.assigned]
        }
    }
})

shape.data(instances.slice(0, 300));

addSlider("Width", shape, "width", 1, 0, 2);

function render() {
    shape.render();
}