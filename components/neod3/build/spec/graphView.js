var click;

click = function(el) {
  var ev;
  ev = document.createEvent("MouseEvent");
  ev.initMouseEvent("click", true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
  return el.dispatchEvent(ev);
};

describe('graphView', function() {
  var graphModel, graphView, svg, _ref;
  _ref = [null, null, null], graphModel = _ref[0], graphView = _ref[1], svg = _ref[2];
  beforeEach(function() {
    svg = d3.select("body").append("svg").attr("width", "100px").attr("height", "100px");
    graphView = neo.graphView();
    graphModel = neo.graphModel().nodes([
      {
        id: 0,
        labels: ['Person', 'Gamer'],
        properties: {
          name: "Johan"
        }
      }, {
        id: 1,
        labels: ['Person'],
        properties: {
          name: "Sebastian"
        }
      }, {
        id: 2,
        labels: ['Thing'],
        properties: {
          name: "Nintendo"
        }
      }
    ]).relationships([
      {
        id: 0,
        source: 0,
        target: 2,
        type: 'PLAYS'
      }, {
        id: 1,
        source: 1,
        target: 2,
        type: 'OWNS',
        properties: {
          since: "1991"
        }
      }
    ]);
    return svg.data([graphModel]).call(graphView);
  });
  afterEach(function() {
    return svg.remove();
  });
  describe('#on', function() {
    return xit('handles click callbacks', function(done) {
      var callback;
      callback = jasmine.createSpy('callback');
      graphView.on('nodeClicked', callback);
      click(svg.select('.node').node());
      return expect(callback).toHaveBeenCalled();
    });
  });
  return describe('data synchronization', function() {
    it('when a node is added', function() {
      graphModel.nodes.add({
        id: 3,
        labels: ['Thing'],
        properties: {
          name: "Sega"
        }
      });
      return expect(svg.selectAll('.node')[0].length).toBe(4);
    });
    return it('when a relationship is removed', function() {
      graphModel.relationships.remove(1);
      return expect(svg.selectAll('.relationship')[0].length).toBe(1);
    });
  });
});
