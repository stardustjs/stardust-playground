/// name: Sin 3D
/// type: 3D

var shapes = Stardust.shape.compile(`
    import Triangle from P3D;

    let k1: float;
    let k2: float;
    let k3: float;

    function getP(x: float): Vector3 {
        return Vector3(cos(x * k1), cos(x * k2), cos(x * k3)) * 100;
    }

    shape Shape(
        x: float
    ) {
        let sz = 1.0;
        let p = getP(x);
        let n = getP(x + PI * 2 * 20 / 100000);
        Triangle(
            p, p + Vector3(sz, 0, 0), n,
            Color(0, 0, 0, 0.5)
        );
    }
`);

var shape = Stardust.shape.create(shapes.Shape, platform);
shape.attr("x", (d) => d);
addSlider("k1", shape, "k1", 16.707, 0, 20);
addSlider("k2", shape, "k2", 14.317, 0, 20);
addSlider("k3", shape, "k3", 17.049, 0, 20);

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