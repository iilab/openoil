var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice;

neo.models.Graph = (function() {
  function Graph(cypher) {
    this.removeRelationships = __bind(this.removeRelationships, this);
    this.removeNodes = __bind(this.removeNodes, this);
    this.findRelationship = __bind(this.findRelationship, this);
    this.findNode = __bind(this.findNode, this);
    this.addRelationships = __bind(this.addRelationships, this);
    this.addNodes = __bind(this.addNodes, this);
    this.nodeMap = {};
    this.relationshipMap = {};
    if (cypher) {
      this.addNodes(cypher.nodes);
      this.addRelationships(cypher.relationships);
    }
  }

  Graph.prototype.nodes = function() {
    var key, value, _ref, _results;
    _ref = this.nodeMap;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      value = _ref[key];
      _results.push(value);
    }
    return _results;
  };

  Graph.prototype.relationships = function() {
    var key, value, _ref, _results;
    _ref = this.relationshipMap;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      value = _ref[key];
      _results.push(value);
    }
    return _results;
  };

  Graph.prototype.addNodes = function(item) {
    var items, node, _base, _i, _len, _name;
    items = !neo.utils.isArray(item) ? [item] : item;
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      node = !(item instanceof neo.models.Node) ? new neo.models.Node(item.id, item.labels, item.properties) : item;
      (_base = this.nodeMap)[_name = item.id] || (_base[_name] = node);
    }
    return this;
  };

  Graph.prototype.addRelationships = function(item) {
    var items, source, target, _i, _len;
    items = !neo.utils.isArray(item) ? [item] : item;
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      source = this.nodeMap[item.source] || (function() {
        throw "Invalid source";
      })();
      target = this.nodeMap[item.target] || (function() {
        throw "Invalid target";
      })();
      this.relationshipMap[item.id] = new neo.models.Relationship(item.id, source, target, item.type, item.properties);
    }
    return this;
  };

  Graph.prototype.findNode = function(id) {
    return this.nodeMap[id];
  };

  Graph.prototype.findRelationship = function(id) {
    return this.relationshipMap[id];
  };

  Graph.prototype.merge = function(result) {
    this.addNodes(result.nodes);
    this.addRelationships(result.relationships);
    return this;
  };

  Graph.prototype.removeNodes = function() {
    var id, rId, rel, rels, remove, _i, _len;
    remove = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (arguments.length === 0) {
      this.nodeMap = {};
      this.relationshipMap = {};
      return this;
    }
    remove = neo.utils.isArray(remove[0]) ? remove[0] : remove;
    for (_i = 0, _len = remove.length; _i < _len; _i++) {
      id = remove[_i];
      rels = (function() {
        var _ref, _results;
        _ref = this.relationshipMap;
        _results = [];
        for (rId in _ref) {
          if (!__hasProp.call(_ref, rId)) continue;
          rel = _ref[rId];
          if (rel.source.id === id || rel.target.id === id) {
            _results.push(rel.id);
          }
        }
        return _results;
      }).call(this);
      this.removeRelationships(rels);
      delete this.nodeMap[id];
    }
    return this;
  };

  Graph.prototype.removeRelationships = function() {
    var id, remove, _i, _len;
    remove = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (arguments.length === 0) {
      this.relationshipMap = {};
      return this;
    }
    remove = neo.utils.isArray(remove[0]) ? remove[0] : remove;
    for (_i = 0, _len = remove.length; _i < _len; _i++) {
      id = remove[_i];
      delete this.relationshipMap[id];
    }
    return this;
  };

  return Graph;

})();
