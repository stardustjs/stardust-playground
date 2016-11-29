/// name: Binning
/// type: 2D

// Convert the SVG file to Stardust shape spec.
let isotype = new Stardust.shape.circle();

// Create the shape object.
let isotypes = Stardust.shape.create(isotype, platform);

let isotypeHeight = 18;

let xScale = Stardust.scale.linear()
    .domain([ 0, 1 ])
    .range([ 20, 28 ]);
let yScale = Stardust.scale.linear()
    .domain([ 0, 1 ])
    .range([ 468, 460 ]);

let colors = [[31,119,180],[255,127,14],[44,160,44]];
colors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 1 ]);

isotypes.attr("center", Stardust.scale.Vector2(
    xScale(d => d % 5),
    yScale(d => Math.floor(d / 5))
));
isotypes.attr("radius", 4.0);
isotypes.attr("color", [ 0, 0, 0, 1 ]);

isotypes.instance((d, index) => {
    let data = [];
    for(let i = 0; i < d * 2; i++) data.push(i);
    return {
        data: data,
        attrs: {
            color: colors[index % colors.length]
        },
        onRender: () => {
            let offset = 20 + 160 * Math.floor(index / colors.length) + (index % colors.length) * 45;
            xScale.range([ offset, 8 + offset ]);
        }
    };
});

isotypes.data([
    27, 53, 91, 52, 112, 42, 107, 91, 68, 56, 115, 86, 26, 102, 28, 23, 119, 110
]);

function render() {
    isotypes.render();
}
