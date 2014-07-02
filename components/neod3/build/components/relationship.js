var __hasProp = {}.hasOwnProperty;

neo.models.Relationship = (function() {
  function Relationship(id, source, target, type, properties) {
    var key, value;
    this.id = id;
    this.source = source;
    this.target = target;
    this.type = type;
    this.propertyMap = properties;
    this.propertyList = (function() {
      var _ref, _results;
      _ref = this.propertyMap;
      _results = [];
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        _results.push({
          key: key,
          value: value
        });
      }
      return _results;
    }).call(this);
  }

  Relationship.prototype.toJSON = function() {
    return this.propertyMap;
  };

  Relationship.prototype.isNode = false;

  Relationship.prototype.isRelationship = true;

  return Relationship;

})();
