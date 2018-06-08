/// name: Binning
/// type: 2D


let circle = Stardust.mark.circle();

// Create the mark object.
let circles = Stardust.mark.create(circle, platform);

let isotypeHeight = 18;

let xScale = Stardust.scale.linear()
    .domain([0, 1])
    .range([20, 28]);
let yScale = Stardust.scale.linear()
    .domain([0, 1])
    .range([468, 460]);

let colors = [[31, 119, 180], [255, 127, 14], [44, 160, 44]];
colors = colors.map((x) => [x[0] / 255, x[1] / 255, x[2] / 255, 1]);

circles.attr("center", Stardust.scale.Vector2(
    xScale(d => d % 5),
    yScale(d => Math.floor(d / 5))
));
circles.attr("radius", 4.0);
circles.attr("color", [0, 0, 0, 1]);

circles.instance((d, index) => {
    let data = [];
    for (let i = 0; i < d * 2; i++) data.push(i);
    return data;
}, (d, index) => {
    let offset = 20 + 160 * Math.floor(index / colors.length) + (index % colors.length) * 45;
    xScale.range([offset, 8 + offset]);
    return {
        color: colors[index % colors.length]
    };
});

circles.data([
    27, 53, 91, 52, 112, 42, 107, 91, 68, 56, 115, 86, 26, 102, 28, 23, 119, 110
]);

function render() {
    circles.render();
}