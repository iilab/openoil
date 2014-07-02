
var fs = require('fs');
var neo4j = require('neo4j-js');

// Display area parameters
var w=1280;
var h=640;

// Load JSON graph file (result of neod3.cypher query)

var myfile = fs.readFileSync('../neod3_results.json', 'utf8');
var myjson = JSON.parse(myfile)

// Load Grass stylesheet

d3.xhr("data/style.grass", "application/grass", function(request){
  drawGraph(request.responseText);
});

// Callback with main features executed when stylesheet is loaded.

var drawGraph = function(styleContents) {

  // Force Directed Layout behavior (including accelerated layout, autozoom)

  function layoutOO() {
      var _force;
      _force = {};
      _force.init = function(render) {
        var accelerateLayout, d3force, forceLayout, linkDistance;
        forceLayout = {};
        linkDistance = 300;

        // Basic Force Layout Parameters
        d3force = d3.layout.force()
                    .linkDistance(linkDistance)
                    .charge(-1000)

        // Accelerated Layout (including Autozoom)
        accelerateLayout = function() {
          var d3Tick, maxAnimationFramesPerSecond, maxComputeTime, maxStepsPerTick, now;
          maxStepsPerTick = 100;
          maxAnimationFramesPerSecond = 60;
          maxComputeTime = 1000 / maxAnimationFramesPerSecond;
          now = window.performance ? function() {
            return window.performance.now();
          } : function() {
            return Date.now();
          };
          d3Tick = d3force.tick;
          return d3force.tick = (function(_this) {
            return function() {
              var startTick, step;
              startTick = now();
              step = maxStepsPerTick;
              while (step-- && now() - startTick < maxComputeTime) {
                if (d3Tick()) {
                  maxStepsPerTick = 2;
                  return true;
                }
              }
              // Autozoom

              // If the graph is cooled down to a certain threshold
              if (d3force.alpha() < 0.01) { 
                // Make the graph stop
                d3force.alpha(-1);
                // Startup Zoom
                zs = zoom.scale()
                zt = zoom.translate();
                zs = h / layers.node().getBBox().height
                dx = (layers.node().getBBox().width/2.0*zs);
                dy = (layers.node().getBBox().height/2.0*zs);

                zoom.scale(zs);
                zoom.translate([dx, dy]);
                layers.transition()
                  .duration(1000)
                  .call(zoom.event, layers);
              }

              render();
              return false;
            };
          })(this);
        };

        accelerateLayout();
        forceLayout.update = function(graph, size) {
          var center, nodes, radius, relationships;
          nodes = graph.nodes();
          relationships = graph.relationships();
          radius = nodes.length * linkDistance / (Math.PI * 2);
          center = {
            x: size[0] / 2,
            y: size[1] / 2
          };
          neo.utils.circularLayout(nodes, center, radius);
          return d3force.nodes(nodes).links(relationships).size(size).start();
        };

        // Drag event handlers for nodes.
        forceLayout.drag = d3force.drag()
          .origin(function(d) { return d; })
          .on("dragstart", dragstarted)
          .on("drag", dragged)
          .on("dragend", dragended);
        return forceLayout;
      };
      return _force;
  }

  // Initialize tooltip
  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      var ret = "";
      if (d.constructor.name == "Object" && d.node) {
        d = d.node
      } else if (d.constructor.name == "Object" && d.relationship) {
        d = d.relationship
      }
      if (d.constructor.name == "Node") {
        ret= "<ul><strong>" + d.labels[0] + "</strong>"
                            + "<li>Name: " + d.propertyMap.name + "</li>"
                            + ( ( d.propertyMap.oc_id ) ? "<li>Open Corporates ID: " + d.propertyMap.oc_id + "</li>" : "" )
                            + ( ( d.propertyMap.directors ) ? "<li>Directors: " + d.propertyMap.directors + "</li>" : "" )
                            + ( ( d.propertyMap.shareholders ) ? "<li>Shareholders: " + d.propertyMap.shareholders + "</li>" : "" )
           + "</ul>";
      }
      else if (d.constructor.name == "Relationship") {
        ret= "<ul><strong>" + d.shortCaption + "</strong>"
                            + ( ( d.propertyMap.immediate ) ? "<li>Immediate Ownership: " + d.propertyMap.immediate + "%</li>" : "" )
                            + ( ( d.propertyMap.ultimate ) ? "<li>Immediate Ownership: " + d.propertyMap.ultimate + "%</li>" : "" )
           + "</ul>";
      }

      return ret;

    })

  // Neod3 graphView which is an API on top of d3 
  //
  var chart = neo.graphView()

  var style = chart.style(styleContents)
      .width(w)
      .height(h)
      .layout(layoutOO())
      .on('nodeClicked', function(d,i){
        // Display sidebar.
        $('#sidebar').text(d.propertyMap.name)

        // Select proper parent <g>
        if (d.constructor.name == "Object" && d.node) {
          d = d.node
        } else if (d.constructor.name == "Object" && d.relationship) {
          d = d.relationship
        }

        // Autozoom on Click.
        zs = zoom.scale()
        zt = zoom.translate();
        zs = h / layers.node().getBBox().height
        dx = (w/2.0) - d.x*zs;
        dy = (h/2.0) - d.y*zs;
        zoom.translate([dx, dy]);
        zoom.scale(zs);
        layers.transition()
            .duration(1000)
            .call(zoom.event, layers);

        // Fade
        node.style("stroke-opacity", function(o) {
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            return thisOpacity;
        });

        link.style("stroke-opacity", function(o) {
            return o.source === d || o.target === d ? 1 : opacity;
        });

      })
      .on('relationshipClicked', function(relationship){
        graphModel.relationships.remove(relationship.id);
      })

  // Creating Strings for the Autocomplete feature
  var strings = myjson.nodes.map(function(val) {
      return { label: val.properties.name, value: val.id };
    });

  var graphModel = neo.graphModel()
    .nodes(myjson.nodes)
    .relationships(myjson.links)

  var zoom = d3.behavior.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", zoomed);

  var svg = d3.select("#openoil")
            .data([graphModel])
            .call(chart)

  var view = d3.select("#openoil")
            .call(zoom)
            .call(tip)

  var layers = d3.selectAll("#openoil > g")

  var nodes = d3.selectAll("g.layer > g.node")
            .attr("id", function(d) {
              return d.id;
            })

  var nodes_inner = d3.selectAll("g.layer > g.node circle, g.layer > g.node text")
            .on('mouseover', function(d) {
              tip.show(d, this.parentNode)
            })
            .on('mouseout', function(d) {
              tip.hide(d, this.parentNode)
            });

  var relationships_inner = d3.selectAll("g.layer > g.relationship rect")
            .on('mouseover', function(d) {
              tip.show(d, this)
            })
            .on('mouseout', function(d) {
              tip.hide(d, this)
            });

  var circles = d3.selectAll("g.nodes > circle")
  //            .call(drag);

  function isConnected(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

//  var linkedByIndex = {};
//  json.links.forEach(function(d) {
//      linkedByIndex[d.source.index + "," + d.target.index] = 1;
//  });

  function sidebarInfo() {

  }

  function zoomed() {
    layers.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d.fixed = true;
    d3.select(this).classed("fixed", true);
    d3.select(this).classed("dragging", true);
  }

  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  function dragended(d) {
    d3.select(this).classed("dragging", false);
  }


  $(function() {

    // Cypher query box
    $( "#cypher" ).submit(function( event ) {
      console.log(event.target[0].value);
      neo4j.connect('https://db.openoil.iilab.org:443/db/data/', function (err, graph) {
          if (err)
              throw err;

          graph.query(event.target[0].value);
              if (err) {
                  console.log(err);
                  console.log(err.stack);
              }
              else {
                  for (var i = 0; i < results.length; i++) {
                      var relationship = results[i].r;
                      var node = results[i].m;

                      // ... do something with the nodes and relationships we just grabbed 
                  }

                  console.log(JSON.stringify(results, null, 5 )); // printing may help to visualize the returned structure
              }

      });
      event.preventDefault();
    });

    // Autocomplete
    $( "#search" ).autocomplete({
        source: strings,
        focus: function( event, ui){
            d3.selectAll("g.node circle")
                .transition()
                .attr("fill", chart.style()['node.Company'].color)
            d3.selectAll("#" +ui.item.value+ " circle")
                .transition()
                .attr("fill", "black")
        },
        response: function( event, ui){
            console.log(ui)
            for (var i in ui.content) {
            console.log(ui.content[i])
              d3.selectAll("#" +ui.content[i].value+ " circle")
                .transition()
                .attr("fill", "grey")
            }
        },
        search: function( event, ui){
//            console.log(chart.style())
//            console.log(chart.style()['node.Company'].color)
            d3.selectAll("g.node circle")
                .transition()
                .attr("fill", chart.style()['node.Company'].color)
        },
        close: function( event, ui){
//            console.log(chart.style())
//            console.log(chart.style()['node.Company'].color)
            d3.selectAll("g.node circle")
                .transition()
                .attr("fill", chart.style()['node.Company'].color)
        }
    })
}); 
}


