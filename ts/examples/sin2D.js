/// name: Sincos 2D Plot
/// type: 2D

var mark = Stardust.mark.custom()
    .input("x", "float")
    .input("k", "float")
    .input("k2", "float")
    .input("k3", "float")
    .input("size", "float", "0.3");
mark.add("P2D.Hexagon")
    .attr("center", "Vector2(cos(k2 * x) * 5 + cos(x * k) * size, sin(x * k) * size + sin(x * k3) * 5) * 30 + Vector2(250, 250)")
    .attr("radius", 1)
    .attr("color", "Color(0, 0, 0, 0.1)");

mark = Stardust.mark.create(mark, platform);

mark.attr("x", (d) => d);
addSlider("k", mark, "k", 101, 1, 200);
addSlider("k2", mark, "k2", 3, 0, 20);
addSlider("k3", mark, "k3", 13, 0, 20);

var data = [];
var N = 100000;
for(var k = 0; k < N; k++) {
    var x = k / N * Math.PI * 2 * 20;
    data.push(x);
}
mark.data(data);

function render() {
    mark.render();
}
function animate(t) {
    mark.attr("size", Math.sin(t) * 0.5);
}