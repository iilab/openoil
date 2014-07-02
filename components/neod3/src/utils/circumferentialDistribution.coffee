neo.utils.distributeCircular = (arrowAngles, minSeparation) ->
  list = []
  for key, angle of arrowAngles.floating
    list.push
      key: key
      angle: angle

  list.sort((a, b) -> a.angle - b.angle)

  runsOfTooDenseArrows = []

  length = (startIndex, endIndex) ->
    if startIndex < endIndex
      endIndex - startIndex + 1
    else
      endIndex + list.length - startIndex + 1

  angle = (startIndex, endIndex) ->
    if startIndex < endIndex
      list[endIndex].angle - list[startIndex].angle
    else
      360 - (list[startIndex].angle - list[endIndex].angle)

  tooDense = (startIndex, endIndex) ->
    angle(startIndex, endIndex) < length(startIndex, endIndex) * minSeparation

  wrapIndex = (index) ->
    if index == -1
      list.length - 1
    else if index >= list.length
      index - list.length
    else
      index

  wrapAngle = (angle) ->
    if angle >= 360
      angle - 360
    else if angle < 0
      angle + 360
    else
      angle

  expand = (startIndex, endIndex) ->
    if length(startIndex, endIndex) < list.length
      if tooDense(startIndex, wrapIndex(endIndex + 1))
        return expand startIndex, wrapIndex(endIndex + 1)
      if tooDense(wrapIndex(startIndex - 1), endIndex)
        return expand wrapIndex(startIndex - 1), endIndex

    runsOfTooDenseArrows.push(
      start: startIndex
      end: endIndex
    )

  for i in [0..list.length - 2]
    if tooDense(i, i + 1)
      expand i, i + 1

  result = {}

  for run in runsOfTooDenseArrows
    center = list[run.start].angle + angle(run.start, run.end) / 2
    runLength = length(run.start, run.end)
    for i in [0..runLength - 1]
      rawAngle = center + (i - (runLength - 1) / 2) * minSeparation
      result[list[wrapIndex(run.start + i)].key] = wrapAngle(rawAngle)

  for key, angle of arrowAngles.floating
    if !result[key]
      result[key] = arrowAngles.floating[key]

  result