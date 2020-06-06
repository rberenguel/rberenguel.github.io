importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");

onmessage = function(event){
    console.log(event)
    var links = event.data.links
    let nodes = event.data.nodes
    let width = event.data.width
    let height = event.data.height
    var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(function(d) {
            return d.id;
        }).distance(30).strength(1.0))
        .force("collide", d3.forceCollide())
        .force("charge", d3.forceManyBody(d=>-(d.inbound+d.outbound)))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .stop()

    simulation.force("link")
        .links(links);

    simulation.force("collide")
        .strength(0.9)
        .radius(130)
        .iterations(3);

    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        postMessage({type: "tick", progress: i / n});
        simulation.tick();
    }

    postMessage({type: "end", links: links, nodes: nodes});
}
