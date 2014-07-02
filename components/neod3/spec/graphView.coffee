click = (el) ->
  ev = document.createEvent("MouseEvent");
  ev.initMouseEvent(
    "click",
    true, true,
    window, null,
    0, 0, 0, 0,
    false, false, false, false,
    0, null
  )
  el.dispatchEvent(ev)

describe 'graphView', ->
  [graphModel, graphView, svg] = [null, null, null]
  beforeEach ->
    svg = d3.select("body").append("svg")
    .attr("width", "100px")
    .attr("height", "100px")

    graphView = neo.graphView()
    graphModel = neo.graphModel()
    .nodes([
      {id: 0, labels: ['Person', 'Gamer'], properties: {name: "Johan"}},
      {id: 1, labels: ['Person'], properties: {name: "Sebastian"}},
      {id: 2, labels: ['Thing'], properties: {name: "Nintendo"}}
    ])
    .relationships([
      {id: 0, source: 0, target: 2, type: 'PLAYS'},
      {id: 1, source: 1, target: 2, type: 'OWNS', properties: {since: "1991"}}
    ])

    svg
    .data([graphModel])
    .call(graphView)

  afterEach ->
    svg.remove()

  describe '#on', ->
    # FIXME: not always working
    xit 'handles click callbacks', (done) ->
      callback = jasmine.createSpy('callback')
      graphView.on 'nodeClicked', callback
      click(svg.select('.node').node())
      expect(callback).toHaveBeenCalled()

  describe 'data synchronization', ->
    it 'when a node is added', ->
      graphModel.nodes.add({id: 3, labels: ['Thing'], properties: {name: "Sega"}})
      expect(svg.selectAll('.node')[0].length).toBe 4

    it 'when a relationship is removed', ->
      graphModel.relationships.remove(1)
      expect(svg.selectAll('.relationship')[0].length).toBe 1
