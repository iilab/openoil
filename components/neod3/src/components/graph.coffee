class neo.models.Graph
  constructor: (cypher) ->
    @nodeMap = {}
    @relationshipMap = {}

    #for node in cypher.nodes
    if cypher
      @addNodes(cypher.nodes)
      @addRelationships(cypher.relationships)

  nodes: ->
    value for own key, value of @nodeMap

  relationships: ->
    value for own key, value of @relationshipMap

  addNodes: (item) =>
    items = if not neo.utils.isArray(item) then [item] else item
    for item in items
      node = if not (item instanceof neo.models.Node)
        new neo.models.Node(item.id, item.labels, item.properties)
      else
        item
      @nodeMap[item.id] ||= node
    @

  addRelationships: (item) =>
    items = if not neo.utils.isArray(item) then [item] else item
    for item in items
      source = @nodeMap[item.source] or throw "Invalid source"
      target = @nodeMap[item.target] or throw "Invalid target"
      @relationshipMap[item.id] = new neo.models.Relationship(item.id, source, target, item.type, item.properties)
    @

  findNode: (id) => @nodeMap[id]

  findRelationship: (id) => @relationshipMap[id]

  merge: (result) ->
    @addNodes(result.nodes)
    @addRelationships(result.relationships)
    @

  removeNodes: (remove...) =>
    if arguments.length is 0
      # remove both nodes and rels
      @nodeMap = {}
      @relationshipMap = {}
      return @

    remove = if neo.utils.isArray(remove[0]) then remove[0] else remove
    for id in remove
      # check if there are any relationships that references the
      # node and remove them as well
      rels = (rel.id for own rId, rel of @relationshipMap when (rel.source.id is id or rel.target.id is id))
      @removeRelationships(rels)
      delete @nodeMap[id]

    @

  removeRelationships: (remove...) =>
    if arguments.length is 0
      @relationshipMap = {}
      return @
    remove = if neo.utils.isArray(remove[0]) then remove[0] else remove
    for id in remove
      delete @relationshipMap[id]

    @
