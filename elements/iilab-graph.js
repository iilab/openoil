function startGraph(viz, that) {
  // Display area parameters
  var w=1280;
  var h=640;

  var cypher = that.cypher
  var param = that.param
  var myjson = {nodes:[], links:[]};

  // Initialise existing d3 elements and events in the DOM
  if (viz) {
    while ( viz.lastChild) {
      viz.removeChild(viz.lastChild);
    }
  }

  console.log(viz)
  
  if (!cypher) { 
    document.body.classList.remove('loading');
    return 
  } else if (!param) {
    param = null;
  }

  neo4j.connect(that.url, function (err, graph) {
      if (err)
          throw err;

      graph.query(cypher, param, function (err, results) {
          if (err) {
              console.log(err);
              console.log(err.stack);
          }
          else {
              myjson = {nodes:[], links:[]};
              
              // console.log(results)

              that.countnodes = results[0].result.nodes.length
              that.countlinks = results[0].result.links.length

              // console.log(that.countnodes)
              // console.log(that.countlinks)

              myjson.nodes = results[0].result.nodes
                               .map(function(row) {
                                    return {
                                        id: row.id,
                                        labels: row.label,
                                        properties: row.node.data
                                    };
                                });

              // console.log(myjson.nodes)

              myjson.links = results[0].result.links
                               .map(function(r) {
                                    var caption, weight, size
                                    if (r.type == "IS_OWNER") {
                                      caption = 'Owns ' + r.data.immediate + "%"
                                      weight = r.data.immediate/10        
                                      size= "18px";
                                    } else if (r.type == "HAS_CONTRACTOR") {
                                      if (r.data.contract_share) {
                                        caption = 'Contractor ' + r.data.contract_share + '%'
                                        weight = r.data.contract_share/5
                                        size= "18px";
                                      } else {
                                        caption = 'Contractor'
                                        weight = 1
                                        size= "18px";
                                      }
                                    } else if (r.type == "HAS_OPERATOR") {
                                      caption = 'Operator ' + r.data.contract_share + '%'
                                      weight = r.data.contract_share/5
                                      size= "18px";
                                    } else if (r.type == "AWARDS") {
                                      caption = 'Awards'
                                      weight = 1
                                      size= "18px";
                                    } else if (r.type == "HAS_JURISDICTION") {
                                      caption = 'Jurisdiction'
                                      weight = 1
                                      size= "18px";
                                    } else {
                                      caption = r.type;
                                      size= "10px";
                                      weight = 1
                                    }
                                    return {
                                        id: r.self.replace(that.url + "relationship/",""),
                                        source: r.start.replace(that.url + "node/",""),
                                        target: r.end.replace(that.url + "node/",""),
                                        type: r.type,
                                        caption: caption,
                                        size: size,
                                        weight: weight,
                                        properties: r.data
                                    };
                                });


/*              for (i = 1; i <= that.depth; i++) {
                      myjson.links = myjson.links.concat(results[0].result.links
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
                                      r = row
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

              }*/

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
          // 800 works for BP 
          //linkDistance = that.countnodes > 100 ? 50 * 200 / that.countnodes : 75;
          linkDistance = 200
          console.log(that.countnodes)
          // -8000 works for BP.
          //d3charge = that.countnodes > 100 ? -8000 * that.countlinks / that.countnodes :  -4000 * that.countlinks / that.countnodes ;
          d3charge = -8000

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
                  d3force.alpha(-0.01);
//                  console.log(nodes.node())
                  
/*                  console.log(viz)
                  console.log(viz.width.baseVal.value)
                  console.log(viz.height.baseVal.value)
                  console.log(layer_nodes)
                  console.log(layer_nodes.node().getBBox().x)
                  console.log(layer_nodes.node().getBBox().y)
                  console.log(layer_nodes.node().getBBox().width)
                  console.log(layer_nodes.node().getBBox().height)*/

                  zs = zoom.scale()
                  //console.log(zs)
                  zt = zoom.translate();
                  zs = ( ( viz.height.baseVal.value - 64 ) / layer_nodes.node().getBBox().height ) < ( viz.width.baseVal.value - 256 / layer_nodes.node().getBBox().width ) ? ( ( viz.height.baseVal.value - 64 ) / layer_nodes.node().getBBox().height ) * 1 : ( viz.width.baseVal.value - 256 / layer_nodes.node().getBBox().width ) * 1
/*                  console.log( viz.width.baseVal.value / 2 )
                  console.log(layer_nodes.node().getBBox().x + layer_nodes.node().getBBox().width / 2)
                  console.log(zt)
                  console.log( viz.height.baseVal.value / 2)
                  console.log(layer_nodes.node().getBBox().y + layer_nodes.node().getBBox().height / 2 )
*/

                  dx = ( viz.width.baseVal.value / 2 ) - ( layer_nodes.node().getBBox().x + layer_nodes.node().getBBox().width / 2 )  ;
                  dy = ( viz.height.baseVal.value / 2 ) - ( layer_nodes.node().getBBox().y + layer_nodes.node().getBBox().height / 2 )  ;
                  //console.log([dx, dy])

                  zoom.x = 256
                  zoom.y = 64
                  zoom.size([viz.width.baseVal.value, viz.height.baseVal.value]);
                  zoom.translate([dx, dy]);
                  zoom.center([viz.width.baseVal.value / 2, viz.height.baseVal.value / 2]);
                  layers.transition()
                    .duration(1000)
                    .call(zoom.event, layers);

                  return

                  
                  zoom.scale(zs);

                  that.fire('graph-zoomed', {zoom: zs})

                  layers.transition()
                    .duration(1000)
                    .call(zoom.event, layers)
                    .call(endall, function() { 
                      that.parentNode.fire('set-slider', {zoom: zs})
                      document.body.classList.remove('loading');
                    });
                }
                // remove tooltips
                tips = document.getElementsByClassName('d3-tip n')
                while(tips[0]) {
                    tips[0].parentNode.removeChild(tips[0]);
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
          var rel_title = ""
          var rel_info = "";
          if (d.type == "IS_OWNER") { 
            rel_title = d.propertyMap.ownership_type 
            rel_info = "Immediate Ownership: <strong>" + d.propertyMap.immediate + "%</strong>"
          } 
          else if (d.type == "HAS_CONTRACTOR")  { 
            rel_title = 'Contractor'
            if (d.propertyMap.contract_share) {
              rel_info = "Contract Share: <strong>" + d.propertyMap.contract_share + "%</strong>"
            }
          } else if (d.type == "HAS_OPERATOR")  { 
            rel_title = 'Operator'
            if (d.propertyMap.contract_share) {
              rel_info = "Contract Share: <strong>" + d.propertyMap.contract_share + "%</strong>"
            }
          } else if (d.type == "AWARDS")  { 
            rel_title = 'Contract Award'
          } else if (d.type == "HAS_JURISDICTION")  { 
            rel_title = 'Jurisdiction'
          } else {
            rel_title = d.type             
          }
          ret= "<ul><li><strong>" + rel_title + "</strong></li><li>" + rel_info + "</li></ul>";
        }
        return ret;

      })

    // Neod3 graphView which is an API on top of d3 
    //

    var chart = neo.graphView(viz)

    var wait = null;

    var style = chart.style(styleContents)
        .width(w)
        .height(h)
        .layout(layoutOO())
        .geometry(NeoD3Geometry_iilab)
        .on('nodeClicked', function(d,i){
          e = window.event;
          if (!(e.metaKey || e.ctrlKey)) { 
          
            // Select proper parent <g>
            if (d.node) {
              d = d.node
            }

            // Display sidebar.

            console.log(d)

            that.fire('stats', {i: d.propertyMap.name , t:"n"});

            that.element.id = d.id
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
            that.element.turnover = d.propertyMap.turnover
            that.element.profit = d.propertyMap.profit
            that.element.assets = d.propertyMap.assets
            that.element.liabilities = d.propertyMap.liabilities
            that.element.contract_share = ""
            that.element.ownership_status = ""
            that.element.source_url = d.propertyMap.source_url
            that.element.source_date = d.propertyMap.source_date
            that.element.confidence = d.propertyMap.confidence
            that.element.document_filename = d.propertyMap.document_filename
            that.element.document_summary = d.propertyMap.document_summary
            that.element.documents = {financials: "", other: ""}

            var i=0, doc = "";
            while (doc = d.propertyMap.documents_filenames[i++]) {
              if (doc.indexOf('financials') > -1 ) {
                that.element.documents.financials = d.propertyMap.documents_filenames[i-1]
              } else if (d.propertyMap.documents_filenames[i] != "") {
                that.element.documents.other = d.propertyMap.documents_filenames[i-1]  
              }
            }

            that.$.iilab_drawer.openDrawer();
            tip.hide(d, that.parentNode)
  /*          
            d3.select(viz).selectAll('g.node circle')
                .transition()
                .attr("fill", chart.style()['node.Company'].color)
                .attr("stroke-width", "4px")
                .attr("opacity", "1")
            d3.select(viz).selectAll('g.node text')
                .transition()
                .attr("fill", "#2a3e92")
            d3.select(viz).selectAll('#id_' + d.id + ' circle')
                .transition()
                .attr("stroke-opacity", "0.5")
                .attr("stroke-width", "32px")
                .attr("fill", "#2a3e92")
            d3.select(viz).selectAll('#id_' + d.id + ' text')
                .transition()
                .attr("fill", "#FFF")
  */
            // Autozoom on Click.
            // TODO: Zoom on clicked node and immediately related nodes. relationshipMap ?

            zs = zoom.scale()
            zt = zoom.translate();
            zs = window.innerHeight / 1000
            dx = (w/2.0) - d.x*zs - 256 ;
            dy = (h/2.0) - d.y*zs - 64;

            zoom.translate([dx, dy]);
            zoom.scale(1);

            layers.transition()
                .duration(1000)
                .call(zoom.event, layers)
                //  .call(endall, function() { 
                //    that.parentNode.fire('set-slider', {zoom: zs})
                //  });
          } else {
            // Select proper parent <g>
            if (d.constructor.name == "Object" && d.node) {
              d = d.node
            }
            tip.hide(d, that.parentNode)
            // console.log(that.depth)
            that.fire('stats', {i: d.propertyMap.name, t:"dc"});
            if (d.labels[0] == "Company") {
              that.cypher = "MATCH p=(a:Company {name: '" + d.propertyMap.name + "'})-[r:IS_OWNER|AWARDS|HAS_CONTRACTOR|HAS_OPERATOR*0.." + that.depth + "]-(n) UNWIND nodes(p) as nodes UNWIND relationships(p) as links RETURN {nodes: [ x in collect(DISTINCT nodes) | {node: x, label: labels(x), id: id(x)}], links: collect(DISTINCT links)} as result"
              return
            }
            else if (d.labels[0] == "Country") {
              that.cypher = "MATCH p=(j:Country {name: '" + d.propertyMap.name + "'})<-[:HAS_JURISDICTION]-(c:Company)<-[r:IS_OWNER*..2]-(d:Company)<-[s:IS_OWNER]-(e:Company)-[:HAS_JURISDICTION]-(f:Country) UNWIND nodes(p) as nodes UNWIND relationships(p) as links RETURN {nodes: [ x in collect(DISTINCT nodes) | {node: x, label: labels(x), id: id(x)}], links: collect(DISTINCT links)} as result"  
              return 
            }
             else if (d.labels[0] == "Contract") {
              that.cypher = "MATCH p=(a:Contract {name: '" + d.propertyMap.name + "'})-[hc:AWARDS|HAS_OPERATOR|HAS_CONTRACTOR]-(c: Company)-[r:IS_OWNER*0.." + that.depth + "]-(n) UNWIND nodes(p) as nodes UNWIND relationships(p) as links RETURN {nodes: [ x in collect(DISTINCT nodes) | {node: x, label: labels(x), id: id(x)}], links: collect(DISTINCT links)} as result"            
              return
            }
          }
        })
/*      .on('nodeDblClicked', function(d,i){
          e = window.event;
//          if (e.shiftKey) { console.log('shift is down')}
//          if (e.altKey) { console.log('alt is down') }
//          if (e.ctrlKey) { console.log('ctrl is down') }
          if (e.metaKey) { 
            // console.log('cmd is down')

            if (d.constructor.name == "Object" && d.node) {
              d = d.node
            }

            var myjson = {nodes:[], links:[]};

//        console.log(bubble_map);

            cypher = "MATCH (n {name: '" + d.propertyMap.name + "'})-[r]-(m) RETURN m as n, labels(m) as label, r";

            neo4j.connect(document.querySelector('openoil-app').url, function (err, graph) {
                if (err)
                    throw err;

                graph.query(cypher, function (err, results) {
                    if (err) {
                        console.log(err);
                        console.log(err.stack);
                    }
                    else {
                        
                        // that.count = results.length
                        console.log(results)

                        myjson.nodes = myjson.nodes.concat(results
                                         .map(function(row) {
                                              return {
                                                id: row.n.id,
                                                labels: row.label,
                                                properties: row.n.data
                                              };
                                          }));



                        // console.log(myjson.nodes)
                        for (i = 1; i <= 1; i++) {
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

                        console.log(myjson.links)

                     graphModel = neo.graphModel()
                      .nodes(myjson.nodes)
                      .relationships(myjson.links)

                    d3.select(viz)
                      .data([graphModel])
                      .call(chart)
                }
              })
            });
          
          }
          else {
            // Select proper parent <g>
            if (d.constructor.name == "Object" && d.node) {
              d = d.node
            }
            tip.hide(d, that.parentNode)
            console.log(that.depth)
            that.fire('stats', {i: d.propertyMap.name, t:"dc"});
            if (d.labels[0] == "Company") {
              that.cypher = "MATCH p=(a:Company {name: '" + d.propertyMap.name + "'})-[r:IS_OWNER|AWARDS|HAS_CONTRACTOR|HAS_OPERATOR*0.." + that.depth + "]-(n) UNWIND nodes(p) as nodes UNWIND relationships(p) as links RETURN {nodes: [ x in collect(DISTINCT nodes) | {node: x, label: labels(x), id: id(x)}], links: collect(DISTINCT links)} as result"
            }
            else if (d.labels[0] == "Country") {
              that.cypher = "MATCH p=(j:Country {name: '" + d.propertyMap.name + "'})<-[:HAS_JURISDICTION]-(c:Company)<-[r:IS_OWNER*..2]-(d:Company)<-[s:IS_OWNER]-(e:Company)-[:HAS_JURISDICTION]-(f:Country) UNWIND nodes(p) as nodes UNWIND relationships(p) as links RETURN {nodes: [ x in collect(DISTINCT nodes) | {node: x, label: labels(x), id: id(x)}], links: collect(DISTINCT links)} as result"   
            }
             else if (d.labels[0] == "Contract") {
              that.cypher = "MATCH p=(a:Contract {name: '" + d.propertyMap.name + "'})-[hc:AWARDS|HAS_OPERATOR|HAS_CONTRACTOR]-(c: Company)-[r:IS_OWNER*0.." + that.depth + "]-(n) UNWIND nodes(p) as nodes UNWIND relationships(p) as links RETURN {nodes: [ x in collect(DISTINCT nodes) | {node: x, label: labels(x), id: id(x)}], links: collect(DISTINCT links)} as result"            
            }

          }
        }) */
      .on('relationshipClicked', function(d,i){
          console.trace()
          if (d.constructor.name == "Object" && d.relationship) {
                    d = d.relationship
          }
          //console.log(d)
          that.fire('stats', {i: d.type , t:"r"});

          that.element.id = d.id
          that.element._type = "relationship"
          that.element.type = d.type
          that.element.source = d.source
          that.element.target = d.target
          that.element.ownership_type = d.propertyMap.ownership_type
          that.element.immediate = d.propertyMap.immediate
          that.element.ultimate = d.propertyMap.ultimate
          that.element.contract_share = d.propertyMap.contract_share
          that.element.ownership_status = d.propertyMap.ownership_status
          that.element.source_url = d.propertyMap.source_url
          that.element.source_date = d.propertyMap.source_date
          that.element.confidence = d.propertyMap.confidence

          that.$.iilab_drawer.openDrawer();

        })
    // Creating Strings for the Autocomplete feature

    // console.log('autocomplete strings')
    // console.log(myjson.nodes)
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
              .attr("width", window.innerWidth - 256 ).attr("height",window.innerHeight - 64)
              .data([graphModel])
              .call(chart)

    var view = d3.select(viz)
              .call(zoom)
              .on("dblclick.zoom", null)
              .call(tip);

    var layers = d3.select(viz).selectAll("g.layer")

    var layer_nodes = d3.select(viz).selectAll("g.layer.nodes")

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

    var nodes_inner = d3.select(viz).selectAll("g.layer > g.node")
              .on('mouseover', function(d) {
                tip.show(d, this)
                d3.select(this).classed('highlight', true)
              })
              .on('mouseout', function(d) {
                tip.hide(d, this)
                d3.select(this).classed('highlight', false)
              });

    var relationships_inner = d3.select(viz).selectAll("g.layer > g.relationship .overlay")
              .on('mouseover', function(d) {
                tip.show(d, this)
                d3.select(this.parentNode).classed('highlight', true)
              })
              .on('mouseout', function(d) {
                tip.hide(d, this)
                d3.select(this.parentNode).classed('highlight', false)
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
//      console.log("in zoomslider listener")
//      console.log(e.detail.zoom)
      //console.log(zoom.x)
      //console.log(zoom.y)
      //console.log(zoom.size())
      //console.log(zoom.center())
      zoom.scale(e.detail.zoom);
      layers.transition()
        .duration(1000)
        .call(zoom.event, layers)
        .call(endall, function() { 
          that.parentNode.fire('set-slider', {zoom: e.detail.zoom})
        });

//      e.stopPropagation();
    });

    document.addEventListener('search-select', function(e) {
//      console.log("in search-select listener")
      var id_selector = e.detail.node
//      var e = document.createEvent('UIEvents');
//      e.initUIEvent('click', true, true);

      d = d3.select(document.querySelector('openoil-app').shadowRoot.querySelector('iilab-graph').shadowRoot.querySelector('iilab-drawer-panel').querySelector('#viz')).selectAll(id_selector).data()[0];

      //console.log(d)

      // Display sidebar.

      that.fire('stats', {i: d.propertyMap.name , t:"n"});

      that.element.id = d.id
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
      that.element.contract_share = ""
      that.element.ownership_status = ""
      that.element.source_url = d.propertyMap.source_url
      that.element.source_date = d.propertyMap.source_date
      that.element.confidence = d.propertyMap.confidence
      that.element.document_filename = d.propertyMap.document_filename
      that.element.document_summary = d.propertyMap.document_summary
            that.element.documents = {financials: "", other: ""}

            var i=0, doc = "";
            while (doc = d.propertyMap.documents_filenames[i++]) {
              if (doc.indexOf('financials') > -1 ) {
                that.element.documents.financials = d.propertyMap.documents_filenames[i-1]
              } else if (d.propertyMap.documents_filenames[i] != "") {
                that.element.documents.other = d.propertyMap.documents_filenames[i-1]  
              }
            }

      that.$.iilab_drawer.openDrawer();
      tip.hide(d, that.parentNode)

      zs = zoom.scale()
      zt = zoom.translate();
      zs = window.innerHeight / 1000
      dx = (w/2.0) - d.x*zs - 256 ;
      dy = (h/2.0) - d.y*zs - 64;

      zoom.translate([dx, dy]);
      zoom.scale(1);

      layers.transition()
          .duration(1000)
          .call(zoom.event, layers)
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
        if (!(event.target[0].value.indexOf("CREATE") > -1 || event.target[0].value.indexOf("MERGE") > -1 || event.target[0].value.indexOf("SET") > -1 || event.target[0].value.indexOf("DELETE") > -1 || event.target[0].value.indexOf("REMOVE") > -1 || event.target[0].value.indexOf("LOAD") > -1)) {  
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
        }
      });
    }); 
  }
}
