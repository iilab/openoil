function startGraph(topElement, url) {
  // Display area parameters
  var w=1280;
  var h=640;
  //var startupQuery = "MATCH (a)-[r]->(b) WITH a, r, b LIMIT 200 WITH { id: LOWER(REPLACE(a.name, ' ', '_')), labels: labels(a), properties: {name: a.name, oc_id: a.oc_id, other_names: a.other_names, previous_names: a.previous_names, headquarters:a.headquarters, directors: a.directors, shareholders: a.shareholders, foundation_date: a.foundation_date, website: a.website} } as nodea, {id: LOWER(REPLACE(a.name + ' ' + b.name, ' ', '_')), source: LOWER(REPLACE(a.name, ' ', '_')), target: LOWER(REPLACE(b.name, ' ', '_')), type: type(r), properties: { immediate: r.immediate}} as link,b WITH {id: LOWER(REPLACE(b.name, ' ', '_')), labels: labels(b), properties: { name: b.name, oc_id: b.oc_id, other_names: b.other_names, previous_names: b.previous_names, headquarters:b.headquarters, directors: b.directors, shareholders: b.shareholders, foundation_date: b.foundation_date, website: b.website} } as nodeb, nodea, link RETURN {nodes: collect(DISTINCT nodea) + collect(DISTINCT nodeb), links: collect(DISTINCT link)} AS json"
  var BPQuery = "MATCH (n:Company)<-[r]-(m) RETURN n, labels(n) as label, r LiMIT 20 UNION MATCH (m:Company)<-[r]-(n) RETURN n, labels(n) as label, r LiMIT 20"
  var NigeriaQuery = "MATCH (n:Company)<-[r]-(m) RETURN n, labels(n) as label, r LiMIT 20 UNION MATCH (m:Company)<-[r]-(n) RETURN n, labels(n) as label, r LiMIT 20"
  var BPDepth = "2"
  var TestQuery = "MATCH (a:Company {name: 'BP P L C'})-[r:IS_OWNER*0.." + BPDepth + "]->(n) RETURN n, labels(n) as label, r"
  var SmallQuery = "MATCH (n:Company)<-[r]-(m) RETURN n, labels(n) as label, r LiMIT 20 UNION MATCH (m:Company)<-[r]-(n) RETURN n, labels(n) as label, r LiMIT 20"
  var startupQuery = TestQuery
  var myjson = {nodes:[], links:[]};

  // Load JSON graph file (result of neod3.cypher query)
  // var myfile = fs.readFileSync('../neod3_results.json', 'utf8');
  // var myjson = JSON.parse(myfile)

  neo4j.connect(url, function (err, graph) {
      if (err)
          throw err;

      graph.query(startupQuery, function (err, results) {
          if (err) {
              console.log(err);
              console.log(err.stack);
          }
          else {
              myjson = {nodes:[], links:[]};
              
//              console.log(results)

              myjson.nodes = results
                               .map(function(row) {
                                    return {
                                        id: row.n.id,
                                        labels: row.label,
                                        properties: row.n.data
                                    };
                                });

//              console.log(myjson.nodes)

              
              for (i = 1; i <= BPDepth; i++) {
                      myjson.links = myjson.links.concat(results
                               .filter(function(row) {
                                  return (row.r instanceof Array) ? (row.r.length == i) : true
                               })
                               .map(function(row) {
  //                                  console.log(i)
  //                                  console.log(row)
                                    r = (row.r instanceof Array) ? row.r[i-1] : row.r
                                    return {
                                        id: r.self.replace(url + "relationship/",""),
                                        source: r.start.replace(url + "node/",""),
                                        target: r.end.replace(url + "node/",""),
                                        type: r.type,
                                        caption: r.data.immediate + "%",
                                        properties: r.data
                                    }
                                }));

              }

  //            console.log(myjson.links)

              // Load Grass stylesheet

              d3.xhr("data/style.grass", "application/grass", function(request){
                drawGraph(request.responseText);
              });

          }
      })
  });

  var chart;
  var graphModel;

  // Callback with main features executed when stylesheet is loaded.

  var drawGraph = function(styleContents) {

    // Force Directed Layout behavior (including accelerated layout, autozoom)

    function layoutOO() {
        var _force;
        _force = {};
        _force.init = function(render) {
          var accelerateLayout, d3force, forceLayout, linkDistance;
          forceLayout = {};
          linkDistance = 500;
          d3charge = -10000;

          // Basic Force Layout Parameters
          d3force = d3.layout.force()
                      .linkDistance(linkDistance)
                      .charge(d3charge)

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

                // If the layout is cooled down to a certain threshold
                if (d3force.alpha() < 0.01) { 
  //                console.log("Graph has cooled down")
                  // Make the force layout stop
                  //d3force.alpha(-1);

                  // Zoom after cool down
                  zs = zoom.scale()
                  zt = zoom.translate();
                  zs = window.innerHeight / (layers.node().getBBox().height + 250)

  //                dx = (w/2.0) - d.x*zs;
  //                dy = (h/2.0) - d.y*zs;

                  dx = window.innerWidth/2.0 - ((layers.node().getBBox().width ) + layers.node().getBBox().x)*zs;
                  dy = window.innerHeight/2.0 - ((layers.node().getBBox().height - 100) /2.0 + layers.node().getBBox().y)*zs;

                  zoom.translate([dx, dy]);
                  zoom.scale(zs);
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
            radius = nodes.length * linkDistance * 4 / (Math.PI * 2) ;
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
  /*  tip = d3.tip()
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
          ret=  "<ul><strong>" + d.labels[0] + "</strong>"
                + "<li>Name: <strong>" + d.propertyMap.name + "</strong></li>"
                + ( ( d.propertyMap.oc_id ) ? "<li>Open Corporates ID: <strong>" + d.propertyMap.oc_id + "</strong></li>" : "" )
                + ( ( d.propertyMap.directors ) ? "<li>Directors: <strong>" + d.propertyMap.directors.replace(/\n/g, "<br />") + "</strong></li>" : "" )
                + ( ( d.propertyMap.shareholders ) ? "<li>Shareholders: <strong>" + d.propertyMap.shareholders.replace(/\n/g, "<br />") + "</strong></li>" : "" )
                + ( ( d.propertyMap.license_area ) ? "<li>License Areas: <strong>" + d.propertyMap.license_area + "</strong></li>" : "" )
                + ( ( d.propertyMap.field ) ? "<li>Field: <strong>" + d.propertyMap.field + "</strong></li>" : "" )
              + "</ul>";
        }
        else if (d.constructor.name == "Relationship") {
          ret= "<ul><strong>" + d.shortCaption + "</strong>"
                              + ( ( d.propertyMap.immediate ) ? "<li>Immediate Ownership: <strong>" + d.propertyMap.immediate + "%</strong></li>" : "" )
                              + ( ( d.propertyMap.ultimate ) ? "<li>Ultimate Ownership: <strong>" + d.propertyMap.ultimate + "%</strong></li>" : "" )
             + "</ul>";
        }

        return ret;

      })*/

    // Neod3 graphView which is an API on top of d3 
    //
    chart = neo.graphView()

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
          // TODO: Zoom on clicked node and immediately related nodes. relationshipMap ?

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

    // Creating Strings for the Autocomplete feature
    this.strings = myjson.nodes.map(function(val) {
        return { label: val.properties.name, value: val.id };
      });

    graphModel = neo.graphModel()
          .nodes(myjson.nodes)
          .relationships(myjson.links)

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);

    var svg = d3.select(topElement)
              .attr("width", window.innerWidth).attr("height",window.innerHeight)
              .data([graphModel])
              .call(chart)

    var view = d3.select(topElement)
              .call(zoom)
  //            .call(tip)

    var layers = d3.select(topElement).selectAll("g.layer")

    var nodes = d3.select(topElement).selectAll("g.layer > g.node")
              .attr("id", function(d) {
                return d.id;
              })

    var relationships_path = d3.select(topElement).selectAll("g.layer > g.relationship path")
              .attr('fill-opacity', 0)
              .attr('stroke', '#DDD')
              .attr('stroke-width', function(d) { return 2+d.propertyMap.contract_share/5; })
    
    var relationships_text = d3.select(topElement).selectAll("g.layer > g.relationship text")
              .attr('font-size', '18px')


    var nodes_inner = d3.select(topElement).selectAll("g.layer > g.node circle, g.layer > g.node text")
              .on('mouseover', function(d) {
//                d.attr()
              })
              .on('mouseout', function(d) {
//                tip.hide(d, this.parentNode)
              });

    var relationships_inner = d3.select(topElement).selectAll("g.layer > g.relationship rect")
              .on('mouseover', function(d) {
//                tip.show(d, this)
              })
              .on('mouseout', function(d) {
//                tip.hide(d, this)
              });

    var circles = d3.select(topElement).selectAll("g.nodes > circle")
    //            .call(drag);

//    console.log(d3)
      
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
        neo4j.connect(url, function (err, graph) {
            if (err)
                throw err;

            graph.query(event.target[0].value, function (err, results) {
                if (err) {
                    console.log(err);
                    console.log(err.stack);
                }
                else {
                    var mycypher = {nodes:[], links:[]};

                    // console.log(JSON.stringify(results, null, 5 )); // printing may help to visualize the returned structure

                    mycypher.nodes = results[0].json.nodes;
                    mycypher.links = results[0].json.links;

                    graphModel.nodes.remove()
                    graphModel.relationships.remove()

                    graphModel.nodes.add(mycypher.nodes)
                    graphModel.relationships.add(mycypher.links)

                }
            })
        });
        event.preventDefault();
      });
    }); 
  }
}
