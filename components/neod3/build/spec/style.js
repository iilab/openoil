describe('neo.style', function() {
  var grass, styledata;
  styledata = {
    'node': {
      'color': '#aaa',
      'border-width': '2px',
      'caption': 'Node'
    },
    'node.Actor': {
      'color': '#fff'
    },
    'relationship': {
      'color': '#BDC3C7'
    }
  };
  grass = "relationship {\n  color: none;\n  border-color: #e3e3e3;\n  border-width: 1.5px;\n}\n\nnode.User {\n  color: #FF6C7C;\n  border-color: #EB5D6C;\n  caption: '{name}';\n}\n\nnode {\n  diameter: 40px;\n  color: #FCC940;\n  border-color: #F3BA25;\n}";
  beforeEach(function() {
    this.style = neo.style();
    return this.style.loadRules(styledata);
  });
  afterEach(function() {
    return neo.style.defaults.autoColor = true;
  });
  it('generates a default stylesheet', function() {
    return expect(this.style.toSheet()).toMatch(jasmine.any(Object));
  });
  describe('with autoColor=true', function() {
    return it('autogenerates rules from node labels when encountered', function() {
      var node;
      node = new neo.models.Node(1, ['Person'], {});
      this.style.forNode(node);
      return expect(this.style.toSheet()['node.Person']).toBeDefined();
    });
  });
  describe('with autoColor=false', function() {
    return it('does not autogenerate rules from new node types', function() {
      var node;
      neo.style.defaults.autoColor = false;
      node = new neo.models.Node(1, ['Person'], {});
      this.style.forNode(node);
      return expect(this.style.toSheet()['node.Person']).not.toBeDefined();
    });
  });
  describe('#change', function() {
    it('should change node rules', function() {
      var newColor;
      this.style.change({
        isNode: true
      }, {
        color: '#bbb'
      });
      newColor = this.style.forNode().get('color');
      return expect(newColor).toBe('#bbb');
    });
    return it('should change relationship rules', function() {
      var newColor;
      this.style.change({
        isRelationship: true
      }, {
        color: '#bbb'
      });
      newColor = this.style.forRelationship().get('color');
      return expect(newColor).toBe('#bbb');
    });
  });
  describe('#forNode:', function() {
    it('should be able to get parameters for nodes without labels', function() {
      expect(this.style.forNode().get('color')).toBe('#aaa');
      return expect(this.style.forNode().get('border-width')).toBe('2px');
    });
    it('should inherit rules from base node rule', function() {
      expect(this.style.forNode({
        labels: ['Actor']
      }).get('border-width')).toBe('2px');
      return expect(this.style.forNode({
        labels: ['Movie']
      }).get('border-width')).toBe('2px');
    });
    it('should apply rules when specified', function() {
      return expect(this.style.forNode({
        labels: ['Actor']
      }).get('color')).toBe('#fff');
    });
    it('should create new rules for labels that have not been seen before', function() {
      var sheet;
      expect(this.style.forNode({
        labels: ['Movie']
      }).get('color')).toBe('#DFE1E3');
      expect(this.style.forNode({
        labels: ['Person']
      }).get('color')).toBe('#F25A29');
      sheet = this.style.toSheet();
      expect(sheet['node.Movie']['color']).toBe('#DFE1E3');
      return expect(sheet['node.Person']['color']).toBe('#F25A29');
    });
    it('should allocate colors that are not already used by existing rules', function() {
      var sheet;
      this.style.change({
        isNode: true,
        labels: ['Person']
      }, {
        color: '#DFE1E3'
      });
      expect(this.style.forNode({
        labels: ['Movie']
      }).get('color')).toBe('#F25A29');
      sheet = this.style.toSheet();
      expect(sheet['node.Person']['color']).toBe('#DFE1E3');
      return expect(sheet['node.Movie']['color']).toBe('#F25A29');
    });
    return it('should stick to first default color once all default colors have been exhausted', function() {
      var i, _i, _ref;
      for (i = _i = 1, _ref = this.style.defaultColors().length; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        this.style.forNode({
          labels: ["Label " + i]
        });
      }
      this.style.change({
        isNode: true,
        labels: ['Person']
      }, {
        color: '#DFE1E3'
      });
      this.style.change({
        isNode: true,
        labels: ['Movie']
      }, {
        color: '#DFE1E3'
      });
      return this.style.change({
        isNode: true,
        labels: ['Animal']
      }, {
        color: '#DFE1E3'
      });
    });
  });
  describe('#parse:', function() {
    return it('should parse rules from grass text', function() {
      return expect(this.style.parse(grass).node).toEqual(jasmine.any(Object));
    });
  });
  return describe('#resetToDefault', function() {
    return it('should reset to the default styling', function() {
      var color, newColor;
      this.style.change({
        isNode: true
      }, {
        color: '#bbb'
      });
      newColor = this.style.forNode().get('color');
      expect(newColor).toBe('#bbb');
      this.style.resetToDefault();
      color = this.style.forNode().get('color');
      return expect(color).toBe('#DFE1E3');
    });
  });
});
