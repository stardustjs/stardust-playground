/// name: Simple Bar Chart
/// type: 2D

var marks = Stardust.mark.compile(`
    import { Rectangle } from P2D;

    mark Bar(
        index: float,
        height: float,
        N: float,
        x0: float = -1, x1: float = 1, ratio: float = 0.9,
        scale: float = 1,
        y0: float = 0
    ) {
        let step = (x1 - x0) / N;
        let c = x0 + index * step + step / 2;
        Rectangle(
            Vector2(c - step * ratio / 2, y0),
            Vector2(c + step * ratio / 2, y0 - height * scale)
        );
    }
`);

var area = Stardust.mark.create(marks.Bar, platform);
area.attr("index", (d, i) => i);
area.attr("height", (d, i) => d);
area.attr("x0", 10.5);
area.attr("x1", 490.5);
area.attr("N", 6);
area.attr("y0", 200);
area.attr("ratio", 1);
area.attr("scale", 2);

addSlider("Scale", area, "scale", 30, 1, 100);

let array = [];

for (let i = 0; i < 100000; i++) array.push(Math.cos(i / 2534) + Math.sin(i / 534));

area.attr("N", array.length);
area.data(array);

var bar = Stardust.mark.create(marks.Bar, platform);
bar.attr("index", (d, i) => i);
bar.attr("height", (d, i) => d);
bar.attr("x0", 10);
bar.attr("x1", 490);
bar.attr("N", 6);
bar.attr("ratio", 0.9);
bar.attr("scale", 30);
bar.attr("y0", 400);

array = [];
for (let i = 0; i < 20; i++) array.push(Math.cos(i) + 2);
bar.attr("N", array.length);
bar.data(array);

function render() {
    area.render();
    bar.render();
}