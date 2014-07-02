var NeoD3Geometry;

NeoD3Geometry = (function() {
  var addShortenedNextWord, fitCaptionIntoCircle, noEmptyLines, square;

  square = function(distance) {
    return distance * distance;
  };

  function NeoD3Geometry(style) {
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
      relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.type);
      _results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
    }
    return _results;
  };

  NeoD3Geometry.prototype.shortenCaption = function(relationship, caption, targetWidth) {
    var shortCaption, width;
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
      if (relationships.length > 1) {
        distributedAngles = neo.utils.distributeCircular(arrowAngles, 20);
      }
      for (id in distributedAngles) {
        angle = distributedAngles[id];
        relationship = relationshipMap[id];
        if (node === relationship.source) {
          relationship.sourceAngle = angle;
          relationship.startPoint = {
            x: relationship.source.x + Math.cos(angle * Math.PI / 180) * relationship.source.radius,
            y: relationship.source.y + Math.sin(angle * Math.PI / 180) * relationship.source.radius
          };
        }
        if (node === relationship.target) {
          relationship.targetAngle = angle;
          relationship.endPoint = {
            x: relationship.target.x + Math.cos(angle * Math.PI / 180) * relationship.target.radius,
            y: relationship.target.y + Math.sin(angle * Math.PI / 180) * relationship.target.radius
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
      shaftRadius = (parseFloat(this.style.forRelationship(relationship).get('shaft-width')) / 2) || 2;
      headRadius = shaftRadius + 3;
      headHeight = headRadius * 2;
      shaftLength = relationship.arrowLength - headHeight;
      relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2);
      relationship.angle = Math.atan2(dy, dx) / Math.PI * 180;
      relationship.textAngle = relationship.angle;
      if (relationship.angle < -90 || relationship.angle > 90) {
        relationship.textAngle += 180;
      }
      _ref2 = shaftLength > relationship.captionLength ? [relationship.type, relationship.captionLength] : this.shortenCaption(relationship, relationship.type, shaftLength), relationship.shortCaption = _ref2[0], relationship.shortCaptionLength = _ref2[1];
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
