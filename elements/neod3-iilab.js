var neod3_iilab = function() {
  var arrowPath, nodeCaption, nodeOutline, nodeOverlay, noop, relationshipOverlay, relationshipType;
  noop = function() {};

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

  }

var NeoD3Geometry_iilab;

NeoD3Geometry_iilab = (function() {
  var addShortenedNextWord, fitCaptionIntoCircle, noEmptyLines, square;

  square = function(distance) {
    return distance * distance;
  };

  function NeoD3Geometry(style) {
//    console.log('overridden')
    this.style = style;
  }

  addShortenedNextWord = function(line, word, measure) {
    var _results;
    _results = [];
    while (!(word.length <= 2)) {
      word = word.substr(0, word.length - 2) + '\u2026';
      if (measure(word) < line.remainingWidth) {
        line.text += " " + word;
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  noEmptyLines = function(lines) {
    var line, _i, _len;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      if (line.text.length === 0) {
        return false;
      }
    }
    return true;
  };

  fitCaptionIntoCircle = function(node, style) {
    var candidateLines, candidateWords, captionText, consumedWords, emptyLine, fitOnFixedNumberOfLines, fontFamily, fontSize, lineCount, lineHeight, lines, maxLines, measure, template, words, _i, _ref, _ref1;
    template = style.forNode(node).get("caption");
    captionText = style.interpolate(template, node.id, node.propertyMap);
    fontFamily = 'sans-serif';
    fontSize = parseFloat(style.forNode(node).get('font-size'));
    lineHeight = fontSize;
    measure = function(text) {
      return neo.utils.measureText(text, fontFamily, fontSize);
    };
    words = captionText.split(" ");
    emptyLine = function(lineCount, iLine) {
      var baseline, constainingHeight, lineWidth;
      baseline = (1 + iLine - lineCount / 2) * lineHeight;
      constainingHeight = iLine < lineCount / 2 ? baseline - lineHeight : baseline;
      lineWidth = Math.sqrt(square(node.radius) - square(constainingHeight)) * 2;
      return {
        node: node,
        text: '',
        baseline: baseline,
        remainingWidth: lineWidth
      };
    };
    fitOnFixedNumberOfLines = function(lineCount) {
      var iLine, iWord, line, lines, _i, _ref;
      lines = [];
      iWord = 0;
      for (iLine = _i = 0, _ref = lineCount - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; iLine = 0 <= _ref ? ++_i : --_i) {
        line = emptyLine(lineCount, iLine);
        while (iWord < words.length && measure(" " + words[iWord]) < line.remainingWidth) {
          line.text += " " + words[iWord];
          line.remainingWidth -= measure(" " + words[iWord]);
          iWord++;
        }
        lines.push(line);
      }
      if (iWord < words.length) {
        addShortenedNextWord(lines[lineCount - 1], words[iWord], measure);
      }
      return [lines, iWord];
    };
    consumedWords = 0;
    maxLines = node.radius * 2 / fontSize;
    lines = [emptyLine(1, 0)];
    for (lineCount = _i = 1; 1 <= maxLines ? _i <= maxLines : _i >= maxLines; lineCount = 1 <= maxLines ? ++_i : --_i) {
      _ref = fitOnFixedNumberOfLines(lineCount), candidateLines = _ref[0], candidateWords = _ref[1];
      if (noEmptyLines(candidateLines)) {
        _ref1 = [candidateLines, candidateWords], lines = _ref1[0], consumedWords = _ref1[1];
      }
      if (consumedWords >= words.length) {
        return lines;
      }
    }
    return lines;
  };

  NeoD3Geometry.prototype.formatNodeCaptions = function(nodes) {
    var node, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      _results.push(node.caption = fitCaptionIntoCircle(node, this.style));
    }
    return _results;
  };

  NeoD3Geometry.prototype.measureRelationshipCaption = function(relationship, caption) {
    var fontFamily, fontSize, padding;
    fontFamily = 'sans-serif';
    fontSize = parseFloat(this.style.forRelationship(relationship).get('font-size'));
    padding = parseFloat(this.style.forRelationship(relationship).get('padding'));
    return neo.utils.measureText(caption, fontFamily, fontSize) + padding * 2;
  };

  NeoD3Geometry.prototype.captionFitsInsideArrowShaftWidth = function(relationship) {
    return parseFloat(this.style.forRelationship(relationship).get('shaft-width')) > parseFloat(this.style.forRelationship(relationship).get('font-size'));
  };

  NeoD3Geometry.prototype.measureRelationshipCaptions = function(relationships) {
    var relationship, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = relationships.length; _i < _len; _i++) {
      relationship = relationships[_i];
      relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.caption);
      _results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
    }
    return _results;
  };

  NeoD3Geometry.prototype.shortenCaption = function(relationship, caption, targetWidth) {
    var shortCaption, width;
//console.log('In overridden shortenCaption')
    shortCaption = caption;
    while (true) {
      if (shortCaption.length <= 2) {
        return ['', 0];
      }
      shortCaption = shortCaption.substr(0, shortCaption.length - 2) + '\u2026';
      width = this.measureRelationshipCaption(relationship, shortCaption);
      if (width < targetWidth) {
        return [shortCaption, width];
      }
    }
  };

  NeoD3Geometry.prototype.layoutRelationships = function(graph) {
    var alongPath, angle, arrowAngles, distributedAngles, dx, dy, endBreak, headHeight, headRadius, id, node, relationship, relationshipMap, relationships, shaftLength, shaftRadius, startBreak, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
    _ref = graph.nodes();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      relationships = graph.relationships().filter(function(relationship) {
        return relationship.source === node || relationship.target === node;
      });
      relationships_outgoing = graph.relationships().filter(function(relationship) {
        return relationship.source === node;
      });
      relationships_incoming = graph.relationships().filter(function(relationship) {
        return relationship.target === node;
      });
      arrowAngles = {
        floating: {}
      };
      relationshipMap = {};
      for (_j = 0, _len1 = relationships.length; _j < _len1; _j++) {
        relationship = relationships[_j];
        relationshipMap[relationship.id] = relationship;
        dx = relationship.target.x - relationship.source.x;
        dy = relationship.target.y - relationship.source.y;
        if (node === relationship.source) {
          dx = -dx;
          dy = -dy;
        }
        angle = Math.atan2(dy, dx) / Math.PI * 180;
        arrowAngles.floating[relationship.id] = (angle + 180) % 360;
      }
      distributedAngles = arrowAngles.floating;
      if (relationships_outgoing.length > 1) {
//        distributedAngles = neo.utils.distributeCircular(arrowAngles, 20);
      }
      for (id in distributedAngles) {
        angle = distributedAngles[id];
        relationship = relationshipMap[id];
        if (node === relationship.source) {
          relationship.sourceAngle = angle;
          relationship.startPoint = {
            x: relationship.source.x + Math.cos(angle * Math.PI / 180) * relationship.source.radius,
            y: relationship.source.y + Math.sin(angle * Math.PI / 180) * relationship.source.radius
//            x: relationship.source.x, // + Math.cos(angle * Math.PI / 180) * relationship.source.radius,
//            y: relationship.source.y //  + Math.sin(angle * Math.PI / 180) * relationship.source.radius
          };
        }
        if (node === relationship.target) {
          relationship.targetAngle = angle;
          relationship.endPoint = {
            x: relationship.target.x + Math.cos(angle * Math.PI / 180) * relationship.target.radius,
            y: relationship.target.y + Math.sin(angle * Math.PI / 180) * relationship.target.radius
//            x: relationship.target.x, // + Math.cos(angle * Math.PI / 180) * relationship.target.radius,
//            y: relationship.target.y // + Math.sin(angle * Math.PI / 180) * relationship.target.radius
          };
        }
      }
    }
    _ref1 = graph.relationships();
    _results = [];
    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
      relationship = _ref1[_k];
      dx = relationship.endPoint.x - relationship.startPoint.x;
      dy = relationship.endPoint.y - relationship.startPoint.y;
      relationship.arrowLength = Math.sqrt(square(dx) + square(dy));
      alongPath = function(from, distance) {
        return {
          x: from.x + dx * distance / relationship.arrowLength,
          y: from.y + dy * distance / relationship.arrowLength
        };
      };
//      shaftRadius = (parseFloat(this.style.forRelationship(relationship).get('shaft-width')) / 2) || 2;
      shaftRadius = ( relationship.weight / 2 ) > 2 ? ( relationship.weight / 2 ) : 2;
      headRadius = shaftRadius * 2;
      headHeight = headRadius * 5;
      shaftLength = relationship.arrowLength - headHeight;
      relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2);
      relationship.angle = Math.atan2(dy, dx) / Math.PI * 180;
      relationship.textAngle = relationship.angle;
      if (relationship.angle < -90 || relationship.angle > 90) {
        relationship.textAngle += 180;
      }
      _ref2 = shaftLength > relationship.captionLength ? [relationship.caption, relationship.captionLength] : this.shortenCaption(relationship, relationship.caption, shaftLength), relationship.shortCaption = _ref2[0], relationship.shortCaptionLength = _ref2[1];
//      console.log(_ref2)
      if (relationship.captionLayout === "external") {
        startBreak = (shaftLength - relationship.shortCaptionLength) / 2;
        endBreak = shaftLength - startBreak;
        _results.push(relationship.arrowOutline = ['M', 0, shaftRadius, 'L', startBreak, shaftRadius, 'L', startBreak, -shaftRadius, 'L', 0, -shaftRadius, 'Z', 'M', endBreak, shaftRadius, 'L', shaftLength, shaftRadius, 'L', shaftLength, headRadius, 'L', relationship.arrowLength, 0, 'L', shaftLength, -headRadius, 'L', shaftLength, -shaftRadius, 'L', endBreak, -shaftRadius, 'Z'].join(' '));
      } else {
        _results.push(relationship.arrowOutline = ['M', 0, shaftRadius, 'L', shaftLength, shaftRadius, 'L', shaftLength, headRadius, 'L', relationship.arrowLength, 0, 'L', shaftLength, -headRadius, 'L', shaftLength, -shaftRadius, 'L', 0, -shaftRadius, 'Z'].join(' '));
      }
    }
    return _results;
  };

  NeoD3Geometry.prototype.setNodeRadii = function(nodes) {
    var node, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      _results.push(node.radius = parseFloat(this.style.forNode(node).get("diameter")) / 2);
    }
    return _results;
  };

  NeoD3Geometry.prototype.onGraphChange = function(graph) {
    this.setNodeRadii(graph.nodes());
    this.formatNodeCaptions(graph.nodes());
    return this.measureRelationshipCaptions(graph.relationships());
  };

  NeoD3Geometry.prototype.onTick = function(graph) {
    return this.layoutRelationships(graph);
  };

  return NeoD3Geometry;

})();

