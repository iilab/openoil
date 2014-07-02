var __slice = [].slice;

neo.viz = function(el, graph, layout, style) {
  var clickHandler, force, geometry, onNodeClick, onNodeDblClick, onRelationshipClick, render, viz;
  viz = {
    style: style
  };
  el = d3.select(el);
  geometry = new NeoD3Geometry(style);
  viz.trigger = function() {
    var args, event;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  };
  onNodeClick = (function(_this) {
    return function(node) {
      return viz.trigger('nodeClicked', node);
    };
  })(this);
  onNodeDblClick = (function(_this) {
    return function(node) {
      return viz.trigger('nodeDblClicked', node);
    };
  })(this);
  onRelationshipClick = (function(_this) {
    return function(relationship) {
      return viz.trigger('relationshipClicked', relationship);
    };
  })(this);
  render = function() {
    var nodeGroups, relationshipGroups, renderer, _i, _j, _len, _len1, _ref, _ref1, _results;
    geometry.onTick(graph);
    nodeGroups = el.selectAll("g.node").attr("transform", function(node) {
      return "translate(" + node.x + "," + node.y + ")";
    });
    _ref = neo.renderers.node;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      renderer = _ref[_i];
      nodeGroups.call(renderer.onTick, viz);
    }
    relationshipGroups = el.selectAll("g.relationship");
    _ref1 = neo.renderers.relationship;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      renderer = _ref1[_j];
      _results.push(relationshipGroups.call(renderer.onTick, viz));
    }
    return _results;
  };
  force = layout.init(render);
  viz.update = function() {
    var height, layers, nodeGroups, nodes, relationshipGroups, relationships, renderer, width, _i, _j, _len, _len1, _ref, _ref1;
    if (!graph) {
      return;
    }
    height = (function() {
      try {
        return parseInt(el.style('height').replace('px', ''));
      } catch (_error) {}
    })();
    width = (function() {
      try {
        return parseInt(el.style('width').replace('px', ''));
      } catch (_error) {}
    })();
    layers = el.selectAll("g.layer").data(["relationships", "nodes"]);
    layers.enter().append("g").attr("class", function(d) {
      return "layer " + d;
    });
    nodes = graph.nodes();
    relationships = graph.relationships();
    relationshipGroups = el.select("g.layer.relationships").selectAll("g.relationship").data(relationships, function(d) {
      return d.id;
    });
    relationshipGroups.enter().append("g").attr("class", "relationship").on("click", onRelationshipClick);
    geometry.onGraphChange(graph);
    _ref = neo.renderers.relationship;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      renderer = _ref[_i];
      relationshipGroups.call(renderer.onGraphChange, viz);
    }
    relationshipGroups.exit().remove();
    nodeGroups = el.select("g.layer.nodes").selectAll("g.node").data(nodes, function(d) {
      return d.id;
    });
    nodeGroups.enter().append("g").attr("class", "node").call(force.drag).call(clickHandler);
    _ref1 = neo.renderers.node;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      renderer = _ref1[_j];
      nodeGroups.call(renderer.onGraphChange, viz);
    }
    nodeGroups.exit().remove();
    return force.update(graph, [width, height]);
  };
  clickHandler = neo.utils.clickHandler();
  clickHandler.on('click', onNodeClick);
  clickHandler.on('dblclick', onNodeDblClick);
  return viz;
};
