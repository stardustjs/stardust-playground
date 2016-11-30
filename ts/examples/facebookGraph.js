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

for(var i = 0; i < N; i++) {
    nodes[i].x = Math.random() * width;
    nodes[i].y = Math.random() * height;
}

snodes.attr("center", (d) => [ d.x, d.y ]);
snodes.attr("radius", 3);
snodes.attr("color", [ 0, 0, 0, 0.5 ]);
sedges.attr("p1", (d) => [ d.source.x, d.source.y ]);
sedges.attr("p2", (d) => [ d.target.x, d.target.y ]);
sedges.attr("color", [ 0, 0, 0, 0.02 ]);

var force = d3.layout.force()
    .size([ width, height ])
    .nodes(nodes)
    .links(edges);

force.linkStrength(0.05);
force.gravity(0.2);
force.linkDistance(100);
force.start();
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