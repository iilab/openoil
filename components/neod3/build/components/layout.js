neo.layout = (function() {
  var _layout;
  _layout = {};
  _layout.force = function() {
    var _force;
    _force = {};
    _force.init = function(render) {
      var accelerateLayout, d3force, forceLayout, linkDistance;
      forceLayout = {};
      linkDistance = 60;
      d3force = d3.layout.force().linkDistance(linkDistance).charge(-1000);
      accelerateLayout = function() {
        var d3Tick, maxAnimationFramesPerSecond, maxComputeTime, maxStepsPerTick, now;
        maxStepsPerTick = 100;
        maxAnimationFramesPerSecond = 60;
        maxComputeTime = 1000 / maxAnimationFramesPerSecond;
        now = window.performance ? function() {
          return window.performance.now();
        } : function() {
          return Date.now();
        };
        d3Tick = d3force.tick;
        return d3force.tick = (function(_this) {
          return function() {
            var startTick, step;
            startTick = now();
            step = maxStepsPerTick;
            while (step-- && now() - startTick < maxComputeTime) {
              if (d3Tick()) {
                maxStepsPerTick = 2;
                return true;
              }
            }
            render();
            return false;
          };
        })(this);
      };
      accelerateLayout();
      forceLayout.update = function(graph, size) {
        var center, nodes, radius, relationships;
        nodes = graph.nodes();
        relationships = graph.relationships();
        radius = nodes.length * linkDistance / (Math.PI * 2);
        center = {
          x: size[0] / 2,
          y: size[1] / 2
        };
        neo.utils.circularLayout(nodes, center, radius);
        return d3force.nodes(nodes).links(relationships).size(size).start();
      };
      forceLayout.drag = d3force.drag;
      return forceLayout;
    };
    return _force;
  };
  return _layout;
})();
