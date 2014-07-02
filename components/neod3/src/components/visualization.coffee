neo.viz = (el, graph, layout, style) ->
  viz =
    style: style

  el = d3.select(el)
  geometry = new NeoD3Geometry(style)

  # To be overridden
  viz.trigger = (event, args...) ->

  onNodeClick = (node) => viz.trigger('nodeClicked', node)

  onNodeDblClick = (node) => viz.trigger('nodeDblClicked', node)

  onRelationshipClick = (relationship) =>
    viz.trigger('relationshipClicked', relationship)

  render = ->
    geometry.onTick(graph)

    # Only translate nodeGroups, because this simplifies node renderers;
    # relationship renderers always take account of both node positions
    nodeGroups = el.selectAll("g.node")
    .attr("transform", (node) -> "translate(" + node.x + "," + node.y + ")")

    for renderer in neo.renderers.node
      nodeGroups.call(renderer.onTick, viz)

    relationshipGroups = el.selectAll("g.relationship")

    for renderer in neo.renderers.relationship
      relationshipGroups.call(renderer.onTick, viz)

  force = layout.init(render)

  viz.update = ->
    return unless graph

    height = try parseInt(el.style('height').replace('px', ''))
    width  = try parseInt(el.style('width').replace('px', ''))

    layers = el.selectAll("g.layer").data(["relationships", "nodes"])

    layers.enter().append("g")
    .attr("class", (d) -> "layer " + d )

    nodes         = graph.nodes()
    relationships = graph.relationships()

    relationshipGroups = el.select("g.layer.relationships")
    .selectAll("g.relationship").data(relationships, (d) -> d.id)

    relationshipGroups.enter().append("g")
    .attr("class", "relationship")
    .on("click", onRelationshipClick)

    geometry.onGraphChange(graph)

    for renderer in neo.renderers.relationship
      relationshipGroups.call(renderer.onGraphChange, viz)

    relationshipGroups.exit().remove();

    nodeGroups = el.select("g.layer.nodes")
    .selectAll("g.node").data(nodes, (d) -> d.id)

    nodeGroups.enter().append("g")
    .attr("class", "node")
    .call(force.drag)
    .call(clickHandler)

    for renderer in neo.renderers.node
      nodeGroups.call(renderer.onGraphChange, viz);

    nodeGroups.exit().remove();

    force.update(graph, [width, height])

  clickHandler = neo.utils.clickHandler()
  clickHandler.on 'click', onNodeClick
  clickHandler.on 'dblclick', onNodeDblClick
  
  viz 