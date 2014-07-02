body = d3.select("#examples");

parseGraph = function(patternText) {
    var nodePattern = /^\((\w+)?\s*({.*})\)$/;
    var relationshipPattern = /^\((\w+)\)\s*?-\[:(\w+)\]->\s*?\((\w+)\)$/;
    var lines = patternText.split('\n');
    var nodeIdSequence = 0;
    var relationshipsIdSequence = 0;

    return neo.graphModel().nodes(lines.map(function(line) {
            return nodePattern.exec(line);
        }).filter(function(tokens) {
            return tokens;
        }).map(function(tokens) {
            return {
                id: tokens[1] || nodeIdSequence++,
                labels: [],
                properties: eval('(' + tokens[2] + ')')
            };
        })).relationships(lines.map(function(line) {
            return relationshipPattern.exec(line);
        }).filter(function(tokens) {
            return tokens;
        }).map(function(tokens) {
            return {
                id: relationshipsIdSequence++,
                source: tokens[1],
                type: tokens[2],
                target: tokens[3]
            };
        }));
};

graphs = body.select('#graph-list').selectAll("li pre")[0].map(function(pre) {
    return pre.innerText;
}).map(parseGraph);

styles = body.select('#style-list').selectAll("li pre")[0].map(function(pre) {
    return pre.innerText;
});

renderGraph = function(cell, graph) {
    var nodes = graph.nodes();
    var results = [];
    for ( var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.x = node.propertyMap.x;
        results.push(node.y = node.propertyMap.y);
    }
    return results;
};

table = body.select('table');

function layoutUsingXAndYProperties() {
    var layout = {};
    layout.init = function(render) {
        var fixedLayout = {};

        fixedLayout.update = function(graph) {
            var nodes = graph.nodes();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                node.x = node.propertyMap.x;
                node.y = node.propertyMap.y;
            }
            render();
        };

        fixedLayout.drag = function() {};

        return fixedLayout;
    };
    return layout;
}

for (var i = 0; i < graphs.length; i++) {
    var graph = graphs[i];
    var row = table.append('tr');
    for (var j = 0; j < styles.length; j++) {
        var style = styles[j];
        var chart = neo.graphView()
            .style(style)
            .layout(layoutUsingXAndYProperties())
            .width(200);

        row.append('td')
            .append('svg')
            .attr("width", 200)
            .attr("height", 200)
            .data([graph])
            .call(chart);
    }
}
