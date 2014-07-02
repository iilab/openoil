(function() {
  var arrowPath, nodeCaption, nodeOutline, nodeOverlay, noop, relationshipOverlay, relationshipType;
  noop = function() {};
  nodeOutline = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      var circles;
      circles = selection.selectAll('circle.outline').data(function(node) {
        return [node];
      });
      circles.enter().append('circle').classed('outline', true).attr({
        cx: 0,
        cy: 0
      });
      circles.attr({
        r: function(node) {
          return node.radius;
        },
        fill: function(node) {
          return viz.style.forNode(node).get('color');
        },
        stroke: function(node) {
          return viz.style.forNode(node).get('border-color');
        },
        'stroke-width': function(node) {
          return viz.style.forNode(node).get('border-width');
        }
      });
      return circles.exit().remove();
    },
    onTick: noop
  });
  nodeCaption = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      var text;
      text = selection.selectAll('text').data(function(node) {
        return node.caption;
      });
      text.enter().append('text').attr({
        'text-anchor': 'middle'
      });
      text.text(function(line) {
        return line.text;
      }).attr('y', function(line) {
        return line.baseline;
      }).attr('font-size', function(line) {
        return viz.style.forNode(line.node).get('font-size');
      }).attr({
        'fill': function(line) {
          return viz.style.forNode(line.node).get('text-color-internal');
        }
      });
      return text.exit().remove();
    },
    onTick: noop
  });
  nodeOverlay = new neo.Renderer({
    onGraphChange: function(selection) {
      var circles;
      circles = selection.selectAll('circle.overlay').data(function(node) {
        if (node.selected) {
          return [node];
        } else {
          return [];
        }
      });
      circles.enter().insert('circle', '.outline').classed('ring', true).classed('overlay', true).attr({
        cx: 0,
        cy: 0,
        fill: '#f5F6F6',
        stroke: 'rgba(151, 151, 151, 0.2)',
        'stroke-width': '3px'
      });
      circles.attr({
        r: function(node) {
          return node.radius + 6;
        }
      });
      return circles.exit().remove();
    },
    onTick: noop
  });
  arrowPath = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      var paths;
      paths = selection.selectAll('path').data(function(rel) {
        return [rel];
      });
      paths.enter().append('path');
      paths.attr('fill', function(rel) {
        return viz.style.forRelationship(rel).get('color');
      }).attr('stroke', 'none');
      return paths.exit().remove();
    },
    onTick: function(selection) {
      return selection.selectAll('path').attr('d', function(d) {
        return d.arrowOutline;
      }).attr('transform', function(d) {
        return "translate(" + d.startPoint.x + " " + d.startPoint.y + ") rotate(" + d.angle + ")";
      });
    }
  });
  relationshipType = new neo.Renderer({
    onGraphChange: function(selection, viz) {
      var texts;
      texts = selection.selectAll("text").data(function(rel) {
        return [rel];
      });
      texts.enter().append("text").attr({
        "text-anchor": "middle"
      });
      texts.attr('font-size', function(rel) {
        return viz.style.forRelationship(rel).get('font-size');
      }).attr('fill', function(rel) {
        return viz.style.forRelationship(rel).get('text-color-' + rel.captionLayout);
      });
      return texts.exit().remove();
    },
    onTick: function(selection, viz) {
      return selection.selectAll('text').attr('x', function(rel) {
        return rel.midShaftPoint.x;
      }).attr('y', function(rel) {
        return rel.midShaftPoint.y + parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 - 1;
      }).attr('transform', function(rel) {
        return "rotate(" + rel.textAngle + " " + rel.midShaftPoint.x + " " + rel.midShaftPoint.y + ")";
      }).text(function(rel) {
        return rel.shortCaption;
      });
    }
  });
  relationshipOverlay = new neo.Renderer({
    onGraphChange: function(selection) {
      var band, rects;
      rects = selection.selectAll("rect").data(function(rel) {
        return [rel];
      });
      band = 20;
      rects.enter().append('rect').classed('overlay', true).attr('fill', 'yellow').attr('x', 0).attr('y', -band / 2).attr('height', band);
      rects.attr('opacity', function(rel) {
        if (rel.selected) {
          return 0.3;
        } else {
          return 0;
        }
      });
      return rects.exit().remove();
    },
    onTick: function(selection) {
      return selection.selectAll('rect').attr('width', function(d) {
        if (d.arrowLength > 0) {
          return d.arrowLength;
        } else {
          return 0;
        }
      }).attr('transform', function(d) {
        return "translate(" + d.startPoint.x + " " + d.startPoint.y + ") rotate(" + d.angle + ")";
      });
    }
  });
  neo.renderers.node.push(nodeOutline);
  neo.renderers.node.push(nodeCaption);
  neo.renderers.node.push(nodeOverlay);
  neo.renderers.relationship.push(arrowPath);
  neo.renderers.relationship.push(relationshipType);
  return neo.renderers.relationship.push(relationshipOverlay);
})();
