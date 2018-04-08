/// name: Sin 2D
/// type: 2D

var mark = Stardust.mark.create(Stardust.mark.circle(6), platform);

var scale = Stardust.scale.custom(`Vector2(cos(k2 * value) * 5 + cos(value * k) * size, sin(value * k) * size + sin(value * k3) * 5) * 30 + Vector2(250, 250)`);

scale.attr("k", 10);
scale.attr("k2", 3);
scale.attr("k3", 13.2);
scale.attr("size", 1);
mark.attr("center", scale(d => d));
mark.attr("color", [0, 0, 0, 0.1]);
mark.attr("radius", 1);

var data = [];
var N = 100000;
for (var k = 0; k < N; k++) {
    var x = k / N * Math.PI * 10;
    data.push(x);
}
mark.data(data);

function render() {
    mark.render();
}
function animate(t) {
    scale.attr("k2", 10 + Math.sin(t / 12) * 5);
    scale.attr("k3", 10 + Math.sin(t / 10) * 5);
    scale.attr("size", Math.sin(t));
}
