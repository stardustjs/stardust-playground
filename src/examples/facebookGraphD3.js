/// name: Facebook Graph (D3-based Version)
/// type: 2D
/// data: data/facebook_1912.json

var width = 600;
var height = 600;

var nodes = DATA.nodes;
var edges = DATA.edges;
var N = nodes.length;

for (var i = 0; i < N; i++) {
    nodes[i].x = Math.random() * width;
    nodes[i].y = Math.random() * height;
}

var sedges = svg.selectAll("line").data(edges).enter().append("line");
var snodes = svg.selectAll("circle").data(nodes).enter().append("circle");


snodes.attr("cx", (d) => d.x);
snodes.attr("cy", (d) => d.y);
snodes.attr("r", 2);
sedges.attr("x1", (d) => d.source.x);
sedges.attr("y1", (d) => d.source.y);
sedges.attr("x2", (d) => d.target.x);
sedges.attr("y2", (d) => d.target.y);

snodes.style("fill", "rgba(0, 0, 0, 0.5)");
sedges.style("stroke", "rgba(0, 0, 0, 0.02)");

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
    reRender();
});

function render() {
    snodes.attr("cx", (d) => d.x);
    snodes.attr("cy", (d) => d.y);
    sedges.attr("x1", (d) => d.source.x);
    sedges.attr("y1", (d) => d.source.y);
    sedges.attr("x2", (d) => d.target.x);
    sedges.attr("y2", (d) => d.target.y);
}

function finalize() {
    force.stop();
}