neo.Renderer = (function() {
  function Renderer(opts) {
    if (opts == null) {
      opts = {};
    }
    neo.utils.extend(this, opts);
    if (this.onGraphChange == null) {
      this.onGraphChange = function() {};
    }
    if (this.onTick == null) {
      this.onTick = function() {};
    }
  }

  return Renderer;

})();
