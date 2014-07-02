describe 'graphModel', ->
  graphModel = null
  beforeEach ->
    graphModel = neo.graphModel()
  describe '#nodes', ->
    it 'returns the collection when no arguments are given', ->
      expect(graphModel.nodes()).toEqual jasmine.any(Array)

    it 'adds a node to the collection', ->
      graphModel.nodes.add({id: 1})
      expect(graphModel.nodes().length).toBe 1

    it 'adds many nodes from an array', ->
      graphModel.nodes.add([{id: 1}, {id: 2}])
      expect(graphModel.nodes().length).toBe 2

    it 'removes a node from the collection', ->
      node = {id: 1}
      graphModel.nodes.add(node)
      expect(graphModel.nodes().length).toBe 1
      graphModel.nodes.remove(node.id)
      expect(graphModel.nodes().length).toBe 0

    it 'removes orphan relationships', ->
      graphModel.nodes.add([{id: 1}, {id: 2}, {id: 3}, {id: 4}])
      graphModel.relationships.add({id: 1, source: 1, target: 2, type: 'TEST'})
      graphModel.relationships.add({id: 2, source: 3, target: 4, type: 'TEST'})
      graphModel.nodes.remove(1)

      expect(graphModel.relationships.find(1)).toBeUndefined()

    it 'resets nodes', ->
      graphModel.nodes.add([{id: 1}, {id: 2}])
      graphModel.nodes.remove()
      expect(graphModel.nodes().length).toBe 0
      expect(graphModel.nodes.find(1)).toBeUndefined()

    it 'allows bulk adding nodes with initial reset', ->
      graphModel.nodes.add([{id: 1}, {id: 2}])
      graphModel.nodes([{id: 3}, {id: 4}])

      expect(graphModel.nodes.find(1)).toBeUndefined()
      expect(graphModel.nodes.find(3)).toEqual jasmine.any(neo.models.Node)


  describe '#relationships', ->
    it 'returns the collection when no arguments are given', ->
      expect(graphModel.relationships()).toEqual jasmine.any(Array)

    it 'adds a relationship between two nodes', ->
      graphModel.nodes.add([{id: 1}, {id: 2}])
      graphModel.relationships.add({id: 1, source: 1, target: 2, type: 'TEST'})
      expect(graphModel.relationships().length).toBe 1

    it 'removes a relationship between two nodes', ->
      graphModel.nodes.add([{id: 1}, {id: 2}])
      graphModel.relationships.add({id: 1, source: 1, target: 2, type: 'TEST'})
      expect(graphModel.relationships().length).toBe 1

      graphModel.relationships.remove(1)
      expect(graphModel.relationships().length).toBe 0

    it 'fails to add a relationship for non existing nodes', ->
      addRelationship = ->
        graphModel.relationships.add({id: 1, source: 1, target: 2, type: 'TEST'})

      expect(addRelationship).toThrow()

    it 'resets relationships', ->
      graphModel.nodes.add([{id: 1}, {id: 2}, {id: 3}, {id: 4}])
      graphModel.relationships.add({id: 1, source: 1, target: 2, type: 'TEST'})
      graphModel.relationships.add({id: 2, source: 3, target: 4, type: 'TEST'})
      graphModel.relationships.remove()

      expect(graphModel.relationships().length).toBe 0
      expect(graphModel.relationships.find(1)).toBeUndefined()

    it 'allows bulk adding nodes with initial reset', ->
      graphModel.nodes.add([{id: 1}, {id: 2}, {id: 3}, {id: 4}])
      graphModel.relationships.add({id: 1, source: 1, target: 2, type: 'TEST'})
      graphModel.relationships([{id: 2, source: 3, target: 4, type: 'TEST'}])

      expect(graphModel.relationships.find(1)).toBeUndefined()
      expect(graphModel.relationships.find(2)).toEqual jasmine.any(neo.models.Relationship)