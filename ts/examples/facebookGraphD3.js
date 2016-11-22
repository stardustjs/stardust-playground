/// name: Facebook Graph (D3-based Version)
/// type: 2D
/// data: data/facebook_1912.json

var width = 600;
var height = 600;

var nodes = DATA.nodes;
var edges = DATA.edges;
var N = nodes.length;

for(var i = 0; i < N; i++) {
    nodes[i].x = Math.random() * width;
    nodes[i].y = Math.random() * height;
}

var sedges = svg.selectAll("line").data(edges);
sedges.enter().append("line");
var snodes = svg.selectAll("circle").data(nodes);
snodes.enter().append("circle");

snodes.attr("cx", (d) => d.x);
snodes.attr("cy", (d) => d.y);
snodes.attr("r", 2);
sedges.attr("x1", (d) => d.source.x);
sedges.attr("y1", (d) => d.source.y);
sedges.attr("x2", (d) => d.target.x);
sedges.attr("y2", (d) => d.target.y);

snodes.style("fill", "rgba(0, 0, 0, 0.5)");
sedges.style("stroke", "rgba(0, 0, 0, 0.02)");

var force = d3.layout.force()
    .size([ width, height ])
    .nodes(nodes)
    .links(edges);

force.linkStrength(0.05);
force.gravity(0.2);
force.linkDistance(100);
force.start();
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