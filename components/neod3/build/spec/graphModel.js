describe('graphModel', function() {
  var graphModel;
  graphModel = null;
  beforeEach(function() {
    return graphModel = neo.graphModel();
  });
  describe('#nodes', function() {
    it('returns the collection when no arguments are given', function() {
      return expect(graphModel.nodes()).toEqual(jasmine.any(Array));
    });
    it('adds a node to the collection', function() {
      graphModel.nodes.add({
        id: 1
      });
      return expect(graphModel.nodes().length).toBe(1);
    });
    it('adds many nodes from an array', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }
      ]);
      return expect(graphModel.nodes().length).toBe(2);
    });
    it('removes a node from the collection', function() {
      var node;
      node = {
        id: 1
      };
      graphModel.nodes.add(node);
      expect(graphModel.nodes().length).toBe(1);
      graphModel.nodes.remove(node.id);
      return expect(graphModel.nodes().length).toBe(0);
    });
    it('removes orphan relationships', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }, {
          id: 4
        }
      ]);
      graphModel.relationships.add({
        id: 1,
        source: 1,
        target: 2,
        type: 'TEST'
      });
      graphModel.relationships.add({
        id: 2,
        source: 3,
        target: 4,
        type: 'TEST'
      });
      graphModel.nodes.remove(1);
      return expect(graphModel.relationships.find(1)).toBeUndefined();
    });
    it('resets nodes', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }
      ]);
      graphModel.nodes.remove();
      expect(graphModel.nodes().length).toBe(0);
      return expect(graphModel.nodes.find(1)).toBeUndefined();
    });
    return it('allows bulk adding nodes with initial reset', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }
      ]);
      graphModel.nodes([
        {
          id: 3
        }, {
          id: 4
        }
      ]);
      expect(graphModel.nodes.find(1)).toBeUndefined();
      return expect(graphModel.nodes.find(3)).toEqual(jasmine.any(neo.models.Node));
    });
  });
  return describe('#relationships', function() {
    it('returns the collection when no arguments are given', function() {
      return expect(graphModel.relationships()).toEqual(jasmine.any(Array));
    });
    it('adds a relationship between two nodes', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }
      ]);
      graphModel.relationships.add({
        id: 1,
        source: 1,
        target: 2,
        type: 'TEST'
      });
      return expect(graphModel.relationships().length).toBe(1);
    });
    it('removes a relationship between two nodes', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }
      ]);
      graphModel.relationships.add({
        id: 1,
        source: 1,
        target: 2,
        type: 'TEST'
      });
      expect(graphModel.relationships().length).toBe(1);
      graphModel.relationships.remove(1);
      return expect(graphModel.relationships().length).toBe(0);
    });
    it('fails to add a relationship for non existing nodes', function() {
      var addRelationship;
      addRelationship = function() {
        return graphModel.relationships.add({
          id: 1,
          source: 1,
          target: 2,
          type: 'TEST'
        });
      };
      return expect(addRelationship).toThrow();
    });
    it('resets relationships', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }, {
          id: 4
        }
      ]);
      graphModel.relationships.add({
        id: 1,
        source: 1,
        target: 2,
        type: 'TEST'
      });
      graphModel.relationships.add({
        id: 2,
        source: 3,
        target: 4,
        type: 'TEST'
      });
      graphModel.relationships.remove();
      expect(graphModel.relationships().length).toBe(0);
      return expect(graphModel.relationships.find(1)).toBeUndefined();
    });
    return it('allows bulk adding nodes with initial reset', function() {
      graphModel.nodes.add([
        {
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }, {
          id: 4
        }
      ]);
      graphModel.relationships.add({
        id: 1,
        source: 1,
        target: 2,
        type: 'TEST'
      });
      graphModel.relationships([
        {
          id: 2,
          source: 3,
          target: 4,
          type: 'TEST'
        }
      ]);
      expect(graphModel.relationships.find(1)).toBeUndefined();
      return expect(graphModel.relationships.find(2)).toEqual(jasmine.any(neo.models.Relationship));
    });
  });
});
