neo.graphView = ->
  layout = neo.layout.force()
  style = neo.style()
  viz = null
  callbacks = {}

  trigger = (event, args...) ->
    callback.apply(null, args) for callback in callbacks[event]
    # TODO: maybe check here if the graphModel is dirty and redraw?

  chart = (selection) ->
    selection.each (graphModel) ->
      if not viz
        viz = neo.viz(@, graphModel, layout, style)
        graphModel.on 'updated', ->
          viz.update()
        viz.trigger = trigger
      viz.update()
    return

  chart.on = (event, callback) ->
    (callbacks[event] ?= []).push(callback)
    chart

  chart.layout = (value) ->
    return layout unless arguments.length
    layout = value
    chart

  chart.style = (value) ->
    return style.toSheet() unless arguments.length
    style.importGrass(value)
    chart

  chart.width = (value) ->
    return viz.width unless arguments.length
    chart

  chart.height = (value) ->
    return viz.height unless arguments.length
    chart

  chart.update = ->
    viz.update()
    chart

  chart
