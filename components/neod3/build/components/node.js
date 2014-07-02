var __hasProp = {}.hasOwnProperty;

neo.models.Node = (function() {
  function Node(id, labels, properties) {
    var key, value;
    this.id = id;
    this.labels = labels;
    this.propertyMap = properties;
    this.propertyList = (function() {
      var _results;
      _results = [];
      for (key in properties) {
        if (!__hasProp.call(properties, key)) continue;
        value = properties[key];
        _results.push({
          key: key,
          value: value
        });
      }
      return _results;
    })();
  }

  Node.prototype.toJSON = function() {
    return this.propertyMap;
  };

  Node.prototype.isNode = true;

  Node.prototype.isRelationship = false;

  return Node;

})();
