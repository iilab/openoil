neo.graphModel = ->

  graph = new neo.models.Graph()

  model = () ->

  model.callbacks = {}

  model.trigger = (event, args...) ->
    event = 'updated' # hard-code to one event until we need better granularity
    if model.callbacks[event]
      callback.apply(null, args) for callback in model.callbacks[event]

  model.nodes = (items) ->
    return graph.nodes() unless items?
    #nodes.length = 0
    graph.removeNodes().addNodes(items)
    model.trigger('nodesAdded')
    model

  model.nodes.add = (items) ->
    if items?
      graph.addNodes(items)
      model.trigger('nodesAdded')
    model

  model.nodes.find = graph.findNode

  # remove(0)
  # remove(0, 3)
  # remove([0, 3])
  model.nodes.remove = ->
    graph.removeNodes.apply(null, arguments)
    model.trigger('nodesRemoved')
    model

  model.relationships = (items) ->
    return graph.relationships() unless items?
    graph.removeRelationships().addRelationships(items)
    model.trigger('relationshipsAdded')
    model

  model.relationships.add = (items) ->
    if items?
      graph.addRelationships(items)
      model.trigger('relationshipsAdded')
    model

  model.relationships.find = graph.findRelationship

  # remove(0)
  # remove(0, 3)
  # remove([0, 3])
  model.relationships.remove = ->
    graph.removeRelationships.apply(null, arguments)
    model.trigger('relationshipsRemoved')
    model

  model.on = (event, callback) ->
    (model.callbacks[event] ?= []).push(callback)
    model

  model
