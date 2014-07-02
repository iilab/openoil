var __slice = [].slice;

neo.graphView = function() {
  var callbacks, chart, layout, style, trigger, viz;
  layout = neo.layout.force();
  style = neo.style();
  viz = null;
  callbacks = {};
  trigger = function() {
    var args, callback, event, _i, _len, _ref, _results;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    _ref = callbacks[event];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      callback = _ref[_i];
      _results.push(callback.apply(null, args));
    }
    return _results;
  };
  chart = function(selection) {
    selection.each(function(graphModel) {
      if (!viz) {
        viz = neo.viz(this, graphModel, layout, style);
        graphModel.on('updated', function() {
          return viz.update();
        });
        viz.trigger = trigger;
      }
      return viz.update();
    });
  };
  chart.on = function(event, callback) {
    (callbacks[event] != null ? callbacks[event] : callbacks[event] = []).push(callback);
    return chart;
  };
  chart.layout = function(value) {
    if (!arguments.length) {
      return layout;
    }
    layout = value;
    return chart;
  };
  chart.style = function(value) {
    if (!arguments.length) {
      return style.toSheet();
    }
    style.importGrass(value);
    return chart;
  };
  chart.width = function(value) {
    if (!arguments.length) {
      return viz.width;
    }
    return chart;
  };
  chart.height = function(value) {
    if (!arguments.length) {
      return viz.height;
    }
    return chart;
  };
  chart.update = function() {
    viz.update();
    return chart;
  };
  return chart;
};
