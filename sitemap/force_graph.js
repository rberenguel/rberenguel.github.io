var graph = document.getElementById("graph");
var meter = document.querySelector("#progress");



function ticked(data) {
    var progress = data.progress;

    meter.style.width = 100 * progress + "%";
}

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    }).distance(10).strength(1.0))
    .force("collide", d3.forceCollide())
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))

var svg = d3.select(graph)
    .append("svg")
    .style("background-color", "#f4f4f4")
    .attr("height", "100%").attr("width", "100%")
    .call(d3.zoom().on("zoom", function() {
        svg.attr("transform", d3.event.transform)
    }))
    .append("g");

svg.attr("width", graph.clientWidth)
    .attr("height", graph.clientHeight);

svg.select("g").attr("width", "100%")
    .attr("height", "100%");

function redraw() {
    // Extract the width and height that was computed by CSS.
    var width = graph.clientWidth;
    var height = graph.clientHeight;

    // Use the extracted size to set the size of an SVG element.
    svg.select("g")
        .attr("width", width)
        .attr("height", height);
}

var width = svg.attr("width");
var height = svg.attr("height");

function updateSearch() {
    var searchTerm = $("#search").val();
    var regex = new RegExp(searchTerm.replace(/\W/, "").toLowerCase())
    var d3nodes = d3.selectAll(".node > *").filter(d => d.label != undefined)
    d3nodes.filter(d => !regex.test(d.label.toLowerCase())).attr("opacity", 0)
    d3nodes.filter(d => regex.test(d.label.toLowerCase())).attr("opacity", 1)

    var edges = d3.selectAll(".edge")
    var ids = [];
    edges.filter(d => !regex.test(d.source.id.toLowerCase()) && !regex.test(d.target.id.toLowerCase())).attr("opacity", 0)
    edges.filter(d => regex.test(d.source.id.toLowerCase()) || regex.test(d.target.id.toLowerCase())).each(d => {
        ids.push(d.source.id);
        ids.push(d.target.id)
    }).attr("opacity", 1)
    d3nodes.filter(d => ids.includes(d.id)).attr("opacity", 1)
}

$("#search").keyup(updateSearch);

var defs = svg.append("svg:defs");


svg.append("g").attr("class", "edges");
svg.append("g").attr("class", "nodes");

var nodeLabels = [],
    gnodes = [],
    links = [],
    bilinks = [],
    expanded = [];

var node = svg.select(".nodes").selectAll(".node"),
    edge = svg.select(".edges").selectAll(".edge");


d3.json("graph.json").then(function(graphData){

    links = graphData.links;
    gnodes = graphData.nodes.map(d=>{
        if(d.nodes){
            d.links.map(enrichLink)
        }
        return d
    });
    //addInternalLinksFromNodes(nodes);
    links = links.map(d=>{
        enrichLink(d);
        return d
    });
    restart();

})

function enrichLink(link){
    link.sourceId = link.source;
    link.targetId = link.target;
}


function marker(color) {
    defs.append("svg:marker")
        .attr("id", color.replace("#", ""))
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 13)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .style('stroke', 'none')
        .style("fill", color);

    return "url(#" + color.replace("#", "") + ")";
};

function restart() {
    var worker = new Worker("worker.js");


    worker.onmessage = function(event) {
        switch (event.data.type) {
        case "tick": return ticked(event.data);
        case "end": return ended(event.data);
        }
    };

    var flinks = d3.range(gnodes.length - 1).map(function(i) {
        return {
            source: Math.floor(Math.sqrt(i)),
            target: i + 1
        };
    });
    worker.postMessage({nodes: gnodes, links: links, width: width, height: height});
}

function ended
(data) {
    let dnodes = data.nodes,
        dlinks = data.links;
    dnodes.forEach(function(node) {
        nodeLabels.push(node.label)
    });
    meter.style.display = "none";

    simulation
        .nodes(dnodes)
        //.on("tick", tickSimulation)

    simulation.force("link")
        .links(dlinks);

    simulation.force("collide")
        .strength(0.8)
        .radius(70)
        .iterations(3);

    updateNodes(dnodes)
    svg.select(".nodes").selectAll(".node").attr("transform", positionNode);
    updateEdges(dlinks)
    svg.select(".edges").selectAll(".edge > *").attr("d", positionLink);
    
}

function tickSimulation() {
    svg.select(".edges").selectAll(".edge > *").attr("d", positionLink);
    svg.select(".nodes").selectAll(".node").attr("transform", positionNode);
}

function updateEdges(data) {
    edge = edge.data(data, d => d.id);
    exiting = edge.exit();
    exiting.remove();
    entering = edge.enter()
    edge = entering.append("g").attr("class", "edge")
    edge.append("path")
        .attr("fill", "none")
        .attr("stroke", (d) => d.color)
        .attr("marker-end", function(d) {
            if(d.arrow){return marker(d.color)}
        })
        .attr("stroke-width", function(d) {
            return 1;
        }).transition().duration(1000);
}

function updateNodes(data) {
    node = svg.select(".nodes").selectAll(".node").data(data, d=> d.id);
    exiting = node.exit();

    exiting.remove();

    function addLabelToNode(textSelection){
        textSelection.text(function(d) {
            let words = d.label.split(" ")
            let ellipsis = words.length>6 ? "…" : ""
            return words.slice(0, 6).join(" ")+ellipsis
        }).attr("font-size", function(d){
            if(d.kind == "tag"){
                let fontsize = Math.min(d.outbound+8, 48)
                return fontsize+"px"
            }
            if(d.kind == "node"){
                let fontsize = Math.min(d.inbound+8, 48)
                return fontsize+"px"
            }
        }).attr("x", function(d) {
            var w = this.getComputedTextLength();
            return -w / 2;
        }).attr("y", 15).attr("fill", function(d) {
            return "#333";
        }).call(getTextBox)
    }

    addLabelToNode(node.filter(d=>d.nodes).selectAll("text"))

    entering = node.enter();
    node = entering.append("g")
        .attr("class", "node").on("click", d => clicked(d)).on("doubleclick", clicked)

    addLabelToNode(node.append("text").attr("class", "label"))

    var xPad = 16;
    var yPad = 10;

    node.insert("rect", "text")
        .attr("class", "textBox")
        .attr("x", function(d) {
            return d.bbox.x - xPad / 2
        })
        .attr("y", function(d) {
            return d.bbox.y - yPad / 2
        })
        .attr("rx", yPad / 2)
        .attr("ry", yPad / 2)
        .attr("width", function(d) {
            return d.bbox.width + xPad
        })
        .attr("height", function(d) {
            return d.bbox.height + yPad
        })
        .attr("fill-opacity", 0.8)
        .attr("fill", function(d) {
            return d.color
        }).attr("stroke", function(d) {
            return d.color
        });

    node.append("title")
        .text(function(d) {
            return d.id;
        });
}

function clicked(node) {
    window.open(node.url, '_blank');
}

function getTextBox(selection) {
    selection.each(function(d) {
        d.bbox = this.getBBox();
    })
}

function positionLink(d) {
    var offset = 30;

    var midpoint_x = (d.source.x + d.target.x) / 2;
    var midpoint_y = (d.source.y + d.target.y) / 2;

    var dx = (d.target.x - d.source.x);
    var dy = (d.target.y - d.source.y);

    var normalise = Math.sqrt((dx * dx) + (dy * dy));

    var offSetX = midpoint_x + offset*(dy/normalise);
    var offSetY = midpoint_y - offset*(dx/normalise);

    return "M" + d.source.x + "," + d.source.y +
        "S" + offSetX + "," + offSetY +
        " " + d.target.x + "," + d.target.y;
}

function positionNode(d) {
    return "translate(" + d.x + "," + d.y + ")";
}

$(function() {
    $("#search").autocomplete({
        select: function(e, u) {
            updateSearch()
        },
        source: nodeLabels.filter(n => n !== undefined)
    });
});
