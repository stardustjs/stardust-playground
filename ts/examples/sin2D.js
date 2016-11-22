/// name: Sincos 2D Plot
/// type: 2D

var shape = Stardust.shape.custom()
    .input("x", "float")
    .input("k", "float")
    .input("k2", "float")
    .input("k3", "float")
    .input("size", "float", "0.3");
shape.add("P2D.Hexagon")
    .attr("center", "Vector2(cos(k2 * x) * 5 + cos(x * k) * size, sin(x * k) * size + sin(x * k3) * 5) * 30 + Vector2(250, 250)")
    .attr("radius", 1)
    .attr("color", "Color(0, 0, 0, 0.1)");

shape = Stardust.shape.create(shape, platform);

shape.attr("x", (d) => d);
addSlider("k", shape, "k", 101, 1, 200);
addSlider("k2", shape, "k2", 3, 0, 20);
addSlider("k3", shape, "k3", 13, 0, 20);

var data = [];
var N = 100000;
for(var k = 0; k < N; k++) {
    var x = k / N * Math.PI * 2 * 20;
    data.push(x);
}
shape.data(data);

function render() {
    shape.render();
}
function animate(t) {
    shape.attr("size", Math.sin(t) * 0.5);
}