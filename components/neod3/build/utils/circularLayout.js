neo.utils.circularLayout = function(nodes, center, radius) {
  var i, n, unlocatedNodes, _i, _len, _results;
  unlocatedNodes = nodes.filter(function(node) {
    return !((node.x != null) && (node.y != null));
  });
  _results = [];
  for (i = _i = 0, _len = unlocatedNodes.length; _i < _len; i = ++_i) {
    n = unlocatedNodes[i];
    n.x = center.x + radius * Math.sin(2 * Math.PI * i / unlocatedNodes.length);
    _results.push(n.y = center.y + radius * Math.cos(2 * Math.PI * i / unlocatedNodes.length));
  }
  return _results;
};
