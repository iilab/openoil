var __slice = [].slice;

neo.graphModel = function() {
  var graph, model;
  graph = new neo.models.Graph();
  model = function() {};
  model.callbacks = {};
  model.trigger = function() {
    var args, callback, event, _i, _len, _ref, _results;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    event = 'updated';
    if (model.callbacks[event]) {
      _ref = model.callbacks[event];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback.apply(null, args));
      }
      return _results;
    }
  };
  model.nodes = function(items) {
    if (items == null) {
      return graph.nodes();
    }
    graph.removeNodes().addNodes(items);
    model.trigger('nodesAdded');
    return model;
  };
  model.nodes.add = function(items) {
    if (items != null) {
      graph.addNodes(items);
      model.trigger('nodesAdded');
    }
    return model;
  };
  model.nodes.find = graph.findNode;
  model.nodes.remove = function() {
    graph.removeNodes.apply(null, arguments);
    model.trigger('nodesRemoved');
    return model;
  };
  model.relationships = function(items) {
    if (items == null) {
      return graph.relationships();
    }
    graph.removeRelationships().addRelationships(items);
    model.trigger('relationshipsAdded');
    return model;
  };
  model.relationships.add = function(items) {
    if (items != null) {
      graph.addRelationships(items);
      model.trigger('relationshipsAdded');
    }
    return model;
  };
  model.relationships.find = graph.findRelationship;
  model.relationships.remove = function() {
    graph.removeRelationships.apply(null, arguments);
    model.trigger('relationshipsRemoved');
    return model;
  };
  model.on = function(event, callback) {
    var _base;
    ((_base = model.callbacks)[event] != null ? _base[event] : _base[event] = []).push(callback);
    return model;
  };
  return model;
};
