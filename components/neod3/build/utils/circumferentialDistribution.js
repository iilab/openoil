neo.utils.distributeCircular = function(arrowAngles, minSeparation) {
  var angle, center, expand, i, key, length, list, rawAngle, result, run, runLength, runsOfTooDenseArrows, tooDense, wrapAngle, wrapIndex, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3;
  list = [];
  _ref = arrowAngles.floating;
  for (key in _ref) {
    angle = _ref[key];
    list.push({
      key: key,
      angle: angle
    });
  }
  list.sort(function(a, b) {
    return a.angle - b.angle;
  });
  runsOfTooDenseArrows = [];
  length = function(startIndex, endIndex) {
    if (startIndex < endIndex) {
      return endIndex - startIndex + 1;
    } else {
      return endIndex + list.length - startIndex + 1;
    }
  };
  angle = function(startIndex, endIndex) {
    if (startIndex < endIndex) {
      return list[endIndex].angle - list[startIndex].angle;
    } else {
      return 360 - (list[startIndex].angle - list[endIndex].angle);
    }
  };
  tooDense = function(startIndex, endIndex) {
    return angle(startIndex, endIndex) < length(startIndex, endIndex) * minSeparation;
  };
  wrapIndex = function(index) {
    if (index === -1) {
      return list.length - 1;
    } else if (index >= list.length) {
      return index - list.length;
    } else {
      return index;
    }
  };
  wrapAngle = function(angle) {
    if (angle >= 360) {
      return angle - 360;
    } else if (angle < 0) {
      return angle + 360;
    } else {
      return angle;
    }
  };
  expand = function(startIndex, endIndex) {
    if (length(startIndex, endIndex) < list.length) {
      if (tooDense(startIndex, wrapIndex(endIndex + 1))) {
        return expand(startIndex, wrapIndex(endIndex + 1));
      }
      if (tooDense(wrapIndex(startIndex - 1), endIndex)) {
        return expand(wrapIndex(startIndex - 1), endIndex);
      }
    }
    return runsOfTooDenseArrows.push({
      start: startIndex,
      end: endIndex
    });
  };
  for (i = _i = 0, _ref1 = list.length - 2; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
    if (tooDense(i, i + 1)) {
      expand(i, i + 1);
    }
  }
  result = {};
  for (_j = 0, _len = runsOfTooDenseArrows.length; _j < _len; _j++) {
    run = runsOfTooDenseArrows[_j];
    center = list[run.start].angle + angle(run.start, run.end) / 2;
    runLength = length(run.start, run.end);
    for (i = _k = 0, _ref2 = runLength - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
      rawAngle = center + (i - (runLength - 1) / 2) * minSeparation;
      result[list[wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
    }
  }
  _ref3 = arrowAngles.floating;
  for (key in _ref3) {
    angle = _ref3[key];
    if (!result[key]) {
      result[key] = arrowAngles.floating[key];
    }
  }
  return result;
};
