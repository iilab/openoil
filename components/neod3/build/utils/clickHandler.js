neo.utils.clickHandler = function() {
  var cc, event;
  cc = function(selection) {
    var dist, down, last, tolerance, wait;
    dist = function(a, b) {
      return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
    };
    down = void 0;
    tolerance = 5;
    last = void 0;
    wait = null;
    selection.on("mousedown", function() {
      d3.event.target.__data__.fixed = true;
      down = d3.mouse(document.body);
      return last = +new Date();
    });
    return selection.on("mouseup", function() {
      if (dist(down, d3.mouse(document.body)) > tolerance) {

      } else {
        if (wait) {
          window.clearTimeout(wait);
          wait = null;
          return event.dblclick(d3.event.target.__data__);
        } else {
          return wait = window.setTimeout((function(e) {
            return function() {
              event.click(e.target.__data__);
              return wait = null;
            };
          })(d3.event), 250);
        }
      }
    });
  };
  event = d3.dispatch("click", "dblclick");
  return d3.rebind(cc, event, "on");
};
