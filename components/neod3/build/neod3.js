var __hasProp = {}.hasOwnProperty;

window.neo = {};

neo.models = {};

neo.renderers = {
  node: [],
  relationship: []
};

neo.utils = {
  copy: function(src) {
    return JSON.parse(JSON.stringify(src));
  },
  extend: function(dest, src) {
    var k, v;
    if (!neo.utils.isObject(dest) && neo.utils.isObject(src)) {
      return;
    }
    for (k in src) {
      if (!__hasProp.call(src, k)) continue;
      v = src[k];
      dest[k] = v;
    }
    return dest;
  },
  isArray: Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  },
  isObject: function(obj) {
    return Object(obj) === obj;
  }
};
