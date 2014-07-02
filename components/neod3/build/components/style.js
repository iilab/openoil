neo.style = (function() {
  var GraphStyle, Selector, StyleElement, StyleRule, _style;
  _style = function(storage) {
    return new GraphStyle(storage);
  };
  _style.defaults = {
    autoColor: true,
    colors: [
      {
        color: '#DFE1E3',
        'border-color': '#D4D6D7',
        'text-color-internal': '#000000'
      }, {
        color: '#F25A29',
        'border-color': '#DC4717',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#AD62CE',
        'border-color': '#9453B1',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#30B6AF',
        'border-color': '#46A39E',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FF6C7C',
        'border-color': '#EB5D6C',
        'text-color-internal': '#FFFFFF'
      }, {
        color: '#FCC940',
        'border-color': '#F3BA25',
        'text-color-internal': '#000000'
      }, {
        color: '#4356C0',
        'border-color': '#3445A2',
        'text-color-internal': '#FFFFFF'
      }
    ],
    style: {
      'node': {
        'diameter': '40px',
        'color': '#DFE1E3',
        'border-color': '#D4D6D7',
        'border-width': '2px',
        'text-color-internal': '#000000',
        'caption': '{id}',
        'font-size': '10px'
      },
      'relationship': {
        'color': '#D4D6D7',
        'shaft-width': '1px',
        'font-size': '8px',
        'padding': '3px',
        'text-color-external': '#000000',
        'text-color-internal': '#FFFFFF'
      }
    },
    sizes: [
      {
        diameter: '10px'
      }, {
        diameter: '20px'
      }, {
        diameter: '30px'
      }, {
        diameter: '50px'
      }, {
        diameter: '80px'
      }
    ],
    arrayWidths: [
      {
        'shaft-width': '1px'
      }, {
        'shaft-width': '2px'
      }, {
        'shaft-width': '3px'
      }, {
        'shaft-width': '5px'
      }, {
        'shaft-width': '8px'
      }, {
        'shaft-width': '13px'
      }, {
        'shaft-width': '25px'
      }, {
        'shaft-width': '38px'
      }
    ]
  };
  Selector = (function() {
    function Selector(selector) {
      var _ref;
      _ref = selector.indexOf('.') > 0 ? selector.split('.') : [selector, void 0], this.tag = _ref[0], this.klass = _ref[1];
    }

    Selector.prototype.toString = function() {
      var str;
      str = this.tag;
      if (this.klass != null) {
        str += "." + this.klass;
      }
      return str;
    };

    return Selector;

  })();
  StyleRule = (function() {
    function StyleRule(selector, props) {
      this.selector = selector;
      this.props = props;
    }

    StyleRule.prototype.matches = function(selector) {
      if (this.selector.tag === selector.tag) {
        if (this.selector.klass === selector.klass || !this.selector.klass) {
          return true;
        }
      }
      return false;
    };

    StyleRule.prototype.matchesExact = function(selector) {
      return this.selector.tag === selector.tag && this.selector.klass === selector.klass;
    };

    return StyleRule;

  })();
  StyleElement = (function() {
    function StyleElement(selector, data) {
      this.data = data;
      this.selector = selector;
      this.props = {};
    }

    StyleElement.prototype.applyRules = function(rules) {
      var rule, _i, _j, _len, _len1;
      for (_i = 0, _len = rules.length; _i < _len; _i++) {
        rule = rules[_i];
        if (!(rule.matches(this.selector))) {
          continue;
        }
        neo.utils.extend(this.props, rule.props);
        break;
      }
      for (_j = 0, _len1 = rules.length; _j < _len1; _j++) {
        rule = rules[_j];
        if (!(rule.matchesExact(this.selector))) {
          continue;
        }
        neo.utils.extend(this.props, rule.props);
        break;
      }
      return this;
    };

    StyleElement.prototype.get = function(attr) {
      return this.props[attr] || '';
    };

    return StyleElement;

  })();
  GraphStyle = (function() {
    function GraphStyle(storage) {
      this.storage = storage;
      this.rules = [];
      this.loadRules();
    }

    GraphStyle.prototype.selector = function(item) {
      if (item.isNode) {
        return this.nodeSelector(item);
      } else if (item.isRelationship) {
        return this.relationshipSelector(item);
      }
    };

    GraphStyle.prototype.calculateStyle = function(selector, data) {
      return new StyleElement(selector, data).applyRules(this.rules);
    };

    GraphStyle.prototype.forEntity = function(item) {
      return this.calculateStyle(this.selector(item), item);
    };

    GraphStyle.prototype.forNode = function(node) {
      var selector, _ref;
      if (node == null) {
        node = {};
      }
      selector = this.nodeSelector(node);
      if (((_ref = node.labels) != null ? _ref.length : void 0) > 0) {
        this.setDefaultStyling(selector);
      }
      return this.calculateStyle(selector, node);
    };

    GraphStyle.prototype.forRelationship = function(rel) {
      return this.calculateStyle(this.relationshipSelector(rel), rel);
    };

    GraphStyle.prototype.findAvailableDefaultColor = function() {
      var defaultColor, rule, usedColors, _i, _j, _len, _len1, _ref, _ref1;
      usedColors = {};
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        if (rule.props.color != null) {
          usedColors[rule.props.color] = true;
        }
      }
      _ref1 = _style.defaults.colors;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        defaultColor = _ref1[_j];
        if (usedColors[defaultColor.color] == null) {
          return neo.utils.copy(defaultColor);
        }
      }
      return neo.utils.copy(_style.defaults.colors[0]);
    };

    GraphStyle.prototype.setDefaultStyling = function(selector) {
      var rule;
      rule = this.findRule(selector);
      if (_style.defaults.autoColor && (rule == null)) {
        rule = new StyleRule(selector, this.findAvailableDefaultColor());
        this.rules.push(rule);
        return this.persist();
      }
    };

    GraphStyle.prototype.change = function(item, props) {
      var rule, selector;
      selector = this.selector(item);
      rule = this.findRule(selector);
      if (rule == null) {
        rule = new StyleRule(selector, {});
        this.rules.push(rule);
      }
      neo.utils.extend(rule.props, props);
      this.persist();
      return rule;
    };

    GraphStyle.prototype.destroyRule = function(rule) {
      var idx;
      idx = this.rules.indexOf(rule);
      if (idx != null) {
        this.rules.splice(idx, 1);
      }
      return this.persist();
    };

    GraphStyle.prototype.findRule = function(selector) {
      var r, rule, _i, _len, _ref;
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        if (r.matchesExact(selector)) {
          rule = r;
        }
      }
      return rule;
    };

    GraphStyle.prototype.nodeSelector = function(node) {
      var selector, _ref;
      if (node == null) {
        node = {};
      }
      selector = 'node';
      if (((_ref = node.labels) != null ? _ref.length : void 0) > 0) {
        selector += "." + node.labels[0];
      }
      return new Selector(selector);
    };

    GraphStyle.prototype.relationshipSelector = function(rel) {
      var selector;
      if (rel == null) {
        rel = {};
      }
      selector = 'relationship';
      if (rel.type != null) {
        selector += "." + rel.type;
      }
      return new Selector(selector);
    };

    GraphStyle.prototype.importGrass = function(string) {
      var e, rules;
      try {
        rules = this.parse(string);
        this.loadRules(rules);
        return this.persist();
      } catch (_error) {
        e = _error;
      }
    };

    GraphStyle.prototype.loadRules = function(data) {
      var props, rule;
      if (!neo.utils.isObject(data)) {
        data = _style.defaults.style;
      }
      this.rules.length = 0;
      for (rule in data) {
        props = data[rule];
        this.rules.push(new StyleRule(new Selector(rule), neo.utils.copy(props)));
      }
      return this;
    };

    GraphStyle.prototype.parse = function(string) {
      var c, chars, insideProps, insideString, k, key, keyword, prop, props, rules, skipThis, v, val, _i, _j, _len, _len1, _ref, _ref1;
      chars = string.split('');
      insideString = false;
      insideProps = false;
      keyword = "";
      props = "";
      rules = {};
      for (_i = 0, _len = chars.length; _i < _len; _i++) {
        c = chars[_i];
        skipThis = true;
        switch (c) {
          case "{":
            if (!insideString) {
              insideProps = true;
            } else {
              skipThis = false;
            }
            break;
          case "}":
            if (!insideString) {
              insideProps = false;
              rules[keyword] = props;
              keyword = "";
              props = "";
            } else {
              skipThis = false;
            }
            break;
          case "'":
          case "\"":
            insideString ^= true;
            break;
          default:
            skipThis = false;
        }
        if (skipThis) {
          continue;
        }
        if (insideProps) {
          props += c;
        } else {
          if (!c.match(/[\s\n]/)) {
            keyword += c;
          }
        }
      }
      for (k in rules) {
        v = rules[k];
        rules[k] = {};
        _ref = v.split(';');
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          prop = _ref[_j];
          _ref1 = prop.split(':'), key = _ref1[0], val = _ref1[1];
          if (!(key && val)) {
            continue;
          }
          rules[k][key != null ? key.trim() : void 0] = val != null ? val.trim() : void 0;
        }
      }
      return rules;
    };

    GraphStyle.prototype.persist = function() {
      var _ref;
      return (_ref = this.storage) != null ? _ref.add('grass', JSON.stringify(this.toSheet())) : void 0;
    };

    GraphStyle.prototype.resetToDefault = function() {
      this.loadRules();
      return this.persist();
    };

    GraphStyle.prototype.toSheet = function() {
      var rule, sheet, _i, _len, _ref;
      sheet = {};
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        sheet[rule.selector.toString()] = rule.props;
      }
      return sheet;
    };

    GraphStyle.prototype.toString = function() {
      var k, r, str, v, _i, _len, _ref, _ref1;
      str = "";
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        str += r.selector.toString() + " {\n";
        _ref1 = r.props;
        for (k in _ref1) {
          v = _ref1[k];
          if (k === "caption") {
            v = "'" + v + "'";
          }
          str += "  " + k + ": " + v + ";\n";
        }
        str += "}\n\n";
      }
      return str;
    };

    GraphStyle.prototype.nextDefaultColor = 0;

    GraphStyle.prototype.defaultColors = function() {
      return neo.utils.copy(_style.defaults.colors);
    };

    GraphStyle.prototype.interpolate = function(str, id, properties) {
      return str.replace(/\{([^{}]*)\}/g, function(a, b) {
        var r;
        r = properties[b] || id;
        if (typeof r === 'string' || typeof r === 'number') {
          return r;
        } else {
          return a;
        }
      });
    };

    return GraphStyle;

  })();
  return _style;
})();
