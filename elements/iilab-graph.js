function startGraph(viz, that) {
  // Display area parameters
  var w=1280;
  var h=640;

  var query = that.cypher
  var myjson = {nodes:[], links:[]};

  // Load JSON graph file (result of neod3.cypher query)
  // var myfile = fs.readFileSync('../neod3_results.json', 'utf8');
  // var myjson = JSON.parse(myfile)

  neo4j.connect(that.url, function (err, graph) {
      if (err)
          throw err;

      graph.query(query, function (err, results) {
          if (err) {
              console.log(err);
              console.log(err.stack);
          }
          else {
              myjson = {nodes:[], links:[]};
              
              //  console.log(results)

              myjson.nodes = results
                               .map(function(row) {
                                    return {
                                        id: row.n.id,
                                        labels: row.label,
                                        properties: row.n.data
                                    };
                                });

              // console.log(myjson.nodes)

              
              for (i = 1; i <= that.depth; i++) {
                      myjson.links = myjson.links.concat(results
                               .filter(function(row) {
                                  return (row.r instanceof Array) ? (row.r.length == i) : true
                               })
                               .map(function(row) {
                                    // console.log(i)
                                    // console.log(row)
                                    var ret = {};
                                    if (row.r instanceof Array) {
                                      r = row.r[i-1]
                                      ret = {
                                        id: r.self.replace(that.url + "relationship/",""),
                                        source: r.start.replace(that.url + "node/",""),
                                        target: r.end.replace(that.url + "node/",""),
                                        type: r.type,
                                        caption: r.type == "IS_OWNER" ? r.data.immediate + "%" : r.type == "IS_CONTRACTOR" ? r.data.contract_share + '%': '',
                                        weight: r.type == "IS_OWNER" ? r.data.immediate/10 : r.type == "IS_CONTRACTOR" ? r.data.contract_share/5 : 1,
                                        properties: r.data
                                      }
                                    } else {
                                      r = row.r
                                      ret = {
                                        id: r.id,
                                        source: r.start,
                                        target: r.end,
                                        type: r.type,
                                        caption: r.type == "IS_OWNER" ? r.data.immediate + "%" : r.type == "IS_CONTRACTOR" ? r.data.contract_share + '%': '',
                                        weight: r.type == "IS_OWNER" ? r.data.immediate/10 : r.type == "IS_CONTRACTOR" ? r.data.contract_share/5 : 1,
                                        properties: r.data
                                      }
                                    }
                                    return ret;
                                }));

              }

              // console.log(myjson.links)

              // Load Grass stylesheet

              d3.xhr("data/style.grass", "application/grass", function(request){
                drawGraph(request.responseText);
              });

          }
      })
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
          linkDistance = 75;
          d3charge = -8000;

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
                  // layout is done

                  // Zoom after cool down

//                  console.log(layers.node())

                  zs = zoom.scale()
                  zt = zoom.translate();
                  zs = window.innerHeight / (layers.node().getBBox().height * 1.2 )

                  zoom.scale(zs);

                  dx = - (layers.node().getBBox().x)*zs + 100 ;
                  dy = - (layers.node().getBBox().y)*zs + 20 ;
                  that.fire('graph-zoomed', {zoom: zs})

                  zoom.translate([dx, dy]);
                  layers.transition()
                    .duration(1000)
                    .call(zoom.event, layers)
                    .call(endall, function() { 
                      that.parentNode.fire('set-slider', {zoom: zs})
                      console.log("all done") 
                      document.body.classList.remove('loading');
                    });
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
            //neo.utils.circularLayout(nodes, center, radius);
            return d3force.nodes(nodes).links(relationships).size(size)
                    .on('end', function() {
                      document.body.classList.remove('loading');
                    })
                    .start();
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
          // TODO: Change to template
          ret=  "<ul><strong>" + d.labels[0] + "</strong>"
                + "<li><strong>" + d.propertyMap.name + "</strong></li>"
                + ( ( d.propertyMap.oc_id ) ? "<li>Open Corporates ID: <strong>" + d.propertyMap.oc_id + "</strong></li>" : "" )
                + ( ( d.propertyMap.directors ) ? "<li>Directors: <strong>" + d.propertyMap.directors.split(/\n/g).length + "</strong></li>" : "" )
                + ( ( d.propertyMap.shareholders ) ? "<li>Shareholders: <strong>" + d.propertyMap.shareholders.split(/\n/g).length + "</strong></li>" : "" )
                + ( ( d.propertyMap.license_area ) ? "<li>License Areas: <strong>" + d.propertyMap.license_area + "</strong></li>" : "" )
                + ( ( d.propertyMap.field ) ? "<li>Field: <strong>" + d.propertyMap.field + "</strong></li>" : "" )
              + "</ul>";
        }
        else if (d.constructor.name == "Relationship") {
          ret= "<ul><strong>" + d.propertyMap.ownership_type + "</strong>"
                              + ( ( d.propertyMap.immediate ) ? "<li>Immediate Ownership: <strong>" + d.propertyMap.immediate + "%</strong></li>" : "" )
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
        .geometry(NeoD3Geometry_iilab)
        .on('nodeClicked', function(d,i){
          // Select proper parent <g>
          if (d.constructor.name == "Object" && d.node) {
            d = d.node
          }
          // Display sidebar.
          // console.log(d)

          that.element._type = "node"
          that.element.type = d.labels[0]
          that.element.name = d.propertyMap.name 
          that.element.oc_id = d.propertyMap.oc_id
          that.element.directors = ( d.propertyMap.directors ) ? d.propertyMap.directors.split(/\n/g) : null
          that.element.shareholders = ( d.propertyMap.shareholders ) ? d.propertyMap.shareholders.split(/\n/g) : null
          that.element.license_area = d.propertyMap.license_area
          that.element.field = d.propertyMap.field
          that.element.ownership_type = ""
          that.element.immediate = ""
          that.element.ultimate = ""
          that.element.ownership_status = ""
          that.element.source_url = ""
          that.element.source_date = ""
          that.element.confidence = ""

          that.$.iilab_drawer.openDrawer();


          // Autozoom on Click.
          // TODO: Zoom on clicked node and immediately related nodes. relationshipMap ?

          zs = zoom.scale()
          zt = zoom.translate();
          zs = window.innerHeight / 1000
          dx = (w/2.0) - d.x*zs - 100 ;
          dy = (h/2.0) - d.y*zs - 20;

          zoom.translate([dx, dy]);
          zoom.scale(zs);

          layers.transition()
              .duration(1000)
              .call(zoom.event, layers)
              .call(endall, function() { 
                that.parentNode.fire('set-slider', {zoom: zs})
                console.log("all done") 
              });
        })
      .on('nodeDblClicked', function(d,i){
          // Select proper parent <g>
          if (d.constructor.name == "Object" && d.node) {
            d = d.node
          }
          tip.hide(d, that.parentNode)
          console.log(that.depth)
          if (d.labels[0] == "Company") {
            that.cypher = "MATCH (a:Company {name: '" + d.propertyMap.name + "'})-[r:IS_OWNER*0.." + that.depth + "]-(n) RETURN n, labels(n) as label, r"
          }
          else if (d.labels[0] == "Country") {
            that.cypher = "MATCH (a:Country {name: '" + d.propertyMap.name + "'})<-[r:HAS_JURISDICTION*0.." + that.depth + "]-(n) RETURN n, labels(n) as label, r"            
          }
        })
      .on('relationshipClicked', function(d,i){
          if (d.constructor.name == "Object" && d.relationship) {
                    d = d.relationship
          }
          // console.log(d)
          that.element._type = "relationship"
          that.element.type = d.type
          that.element.source = d.source
          that.element.target = d.target
          that.element.ownership_type = d.propertyMap.ownership_type
          that.element.immediate = d.propertyMap.immediate
          that.element.ultimate = d.propertyMap.ultimate
          that.element.ownership_status = d.propertyMap.ownership_status
          that.element.source_url = d.propertyMap.source_url
          that.element.source_date = d.propertyMap.source_date
          that.element.confidence = d.propertyMap.confidence

          that.$.iilab_drawer.openDrawer();

        })
    // Creating Strings for the Autocomplete feature

    autocompleteStrings = myjson.nodes.map(function(val) {
        return { label: val.properties.name, value: "id_" + val.id };
      });

    that.asyncFire('graph-ready', {strings: autocompleteStrings, chart: chart, style: style})

    var graphModel = neo.graphModel()
          .nodes(myjson.nodes)
          .relationships(myjson.links)

    neo.renderers = {
      node: [],
      relationship: []
    };

    neod3_iilab()

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);

    var svg = d3.select(viz)
              .attr("width", window.innerWidth).attr("height",window.innerHeight)
              .data([graphModel])
              .call(chart)

    var view = d3.select(viz)
              .call(zoom)
              .call(tip)

    var layers = d3.select(viz).selectAll("g.layer")

    var nodes = d3.select(viz).selectAll("g.layer > g.node")
              .attr("id", function(d) {
                return "id_" + d.id;
              })

    var relationships_path = d3.select(viz).selectAll("g.layer > g.relationship path")
              .attr('fill-opacity', 1)
              .attr('fill', function(d) { 
              // console.log(d)
                return 'rgb(' 
                + ( (242 - parseInt(d.weight) * 20) < 242 ? (242 - parseInt(d.weight) * 20) : 242 )
                + ',' + ( (262 - parseInt(d.weight)  * 20) < 242 ? (242 - parseInt(d.weight) * 20) : 242 )
                + ',' + ( (346 - parseInt(d.weight)  * 20) < 242 ? (346 - parseInt(d.weight)  * 20) : 242 )
                + ')';
              })
              //  .attr('stroke-width', function(d) { 
              //  return (d.weight);
              //  })
    
    var relationships_text = d3.select(viz).selectAll("g.layer > g.relationship text")

    var nodes_inner = d3.select(viz).selectAll("g.layer > g.node circle, g.layer > g.node text")
              .on('mouseover', function(d) {
                tip.show(d, this)
              })
              .on('mouseout', function(d) {
                tip.hide(d, this.parentNode)
              });

    var relationships_inner = d3.select(viz).selectAll("g.layer > g.relationship .overlay")
              .on('mouseover', function(d) {
                tip.show(d, this)
              })
              .on('mouseout', function(d) {
                tip.hide(d, this)
              });

    var circles = d3.select(viz).selectAll("g.nodes > circle")
    //            .call(drag);

    // console.log(d3)
      
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

    document.addEventListener('zoom-slider', function(e) {
      console.log("in zoomslider listener")
      console.log(e.detail.zoom)
      zoom.scale(e.detail.zoom);
      layers.transition()
        .duration(1000)
        .call(zoom.event, layers)
        .call(endall, function() { 
          that.parentNode.fire('set-slider', {zoom: e.detail.zoom})
          console.log("all done") 
        });

//      e.stopPropagation();
    });

    document.addEventListener('search-select', function(e) {
      console.log("in search-select listener")
      console.log(e.detail.node)
      var e = document.createEvent('UIEvents');
      e.initUIEvent('click', true, true);
      d3.select(document.querySelector('openoil-app').shadowRoot.querySelector('iilab-graph').shadowRoot.querySelector('#viz')).selectAll(e.detail.node).node().dispatchEvent(e);
    });

    function endall(transition, callback) { 
      var n = 0; 
      transition 
          .each(function() { ++n; }) 
          .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
    } 

    $(function() {

      // Cypher query box
      $( "#cypher" ).submit(function( event ) {      
        neo4j.connect(that.url, function (err, graph) {
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
