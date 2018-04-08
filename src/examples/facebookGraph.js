/// name: Facebook Graph
/// type: 2D
/// data: data/facebook_1912.json

var snodes = Stardust.mark.create(Stardust.mark.circle(8), platform);
var sedges = Stardust.mark.create(Stardust.mark.line(), platform);

var width = 600;
var height = 600;

var nodes = DATA.nodes;
var edges = DATA.edges;
var N = nodes.length;

for (var i = 0; i < N; i++) {
    nodes[i].x = Math.random() * width;
    nodes[i].y = Math.random() * height;
}

snodes.attr("center", (d) => [d.x, d.y]);
snodes.attr("radius", 3);
snodes.attr("color", [0, 0, 0, 0.5]);
sedges.attr("p1", (d) => [d.source.x, d.source.y]);
sedges.attr("p2", (d) => [d.target.x, d.target.y]);
sedges.attr("color", [0, 0, 0, 0.02]);

var force = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.index }))
    .force("charge", d3.forceManyBody())
    .force("forceX", d3.forceX(width / 2))
    .force("forceY", d3.forceY(height / 2))

force.nodes(nodes);
force.force("link").links(edges);

force.force("forceX").strength(0.5);
force.force("forceY").strength(0.5);
force.force("link").distance(50);
force.force("link").strength(0.05);
force.force("charge").strength(-40);

force.on("tick", () => {
    snodes.data(nodes);
    sedges.data(edges);
    reRender();
});

function render() {
    sedges.render();
    snodes.render();
}

function finalize() {
    force.stop();
}