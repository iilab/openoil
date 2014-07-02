class NeoD3Geometry
  square = (distance) -> distance * distance

  constructor: (@style) ->

  addShortenedNextWord = (line, word, measure) ->
    until word.length <= 2
      word = word.substr(0, word.length - 2) + '\u2026'
      if measure(word) < line.remainingWidth
        line.text += " " + word
        break

  noEmptyLines = (lines) ->
    for line in lines
      if line.text.length is 0 then return false
    true

  fitCaptionIntoCircle = (node, style) ->
    template = style.forNode(node).get("caption")
    captionText = style.interpolate(template, node.id, node.propertyMap)
    fontFamily = 'sans-serif'
    fontSize = parseFloat(style.forNode(node).get('font-size'))
    lineHeight = fontSize
    measure = (text) ->
      neo.utils.measureText(text, fontFamily, fontSize)

    words = captionText.split(" ")

    emptyLine = (lineCount, iLine) ->
      baseline = (1 + iLine - lineCount / 2) * lineHeight
      constainingHeight = if iLine < lineCount / 2 then baseline - lineHeight else baseline
      lineWidth = Math.sqrt(square(node.radius) - square(constainingHeight)) * 2
      {
      node: node
      text: ''
      baseline: baseline
      remainingWidth: lineWidth
      }

    fitOnFixedNumberOfLines = (lineCount) ->
      lines = []
      iWord = 0;
      for iLine in [0..lineCount - 1]
        line = emptyLine(lineCount, iLine)
        while iWord < words.length and measure(" " + words[iWord]) < line.remainingWidth
          line.text += " " + words[iWord]
          line.remainingWidth -= measure(" " + words[iWord])
          iWord++
        lines.push line
      if iWord < words.length
        addShortenedNextWord(lines[lineCount - 1], words[iWord], measure)
      [lines, iWord]

    consumedWords = 0
    maxLines = node.radius * 2 / fontSize

    lines = [emptyLine(1, 0)]
    for lineCount in [1..maxLines]
      [candidateLines, candidateWords] = fitOnFixedNumberOfLines(lineCount)
      if noEmptyLines(candidateLines)
        [lines, consumedWords] = [candidateLines, candidateWords]
      if consumedWords >= words.length
        return lines
    lines

  formatNodeCaptions: (nodes) ->
      for node in nodes
        node.caption = fitCaptionIntoCircle(node, @style)

  measureRelationshipCaption: (relationship, caption) ->
    fontFamily = 'sans-serif'
    fontSize = parseFloat(@style.forRelationship(relationship).get('font-size'))
    padding = parseFloat(@style.forRelationship(relationship).get('padding'))
    neo.utils.measureText(caption, fontFamily, fontSize) + padding * 2

  captionFitsInsideArrowShaftWidth: (relationship) ->
    parseFloat(@style.forRelationship(relationship).get('shaft-width')) >
    parseFloat(@style.forRelationship(relationship).get('font-size'))

  measureRelationshipCaptions: (relationships) ->
    for relationship in relationships
      relationship.captionLength = @measureRelationshipCaption(relationship, relationship.type)
      relationship.captionLayout =
        if @captionFitsInsideArrowShaftWidth(relationship)
          "internal"
        else
          "external"

  shortenCaption: (relationship, caption, targetWidth) ->
    shortCaption = caption
    while true
      if shortCaption.length <= 2
        return ['', 0]
      shortCaption = shortCaption.substr(0, shortCaption.length - 2) + '\u2026'
      width = @measureRelationshipCaption(relationship, shortCaption)
      if width < targetWidth
        return [shortCaption, width]

  layoutRelationships: (graph) ->
    for node in graph.nodes()
      relationships = graph.relationships().filter((relationship) ->
        relationship.source == node or relationship.target == node
      )
      arrowAngles = { floating: {} }
      relationshipMap = {}
      for relationship in relationships
        relationshipMap[relationship.id] = relationship
        dx = relationship.target.x - relationship.source.x
        dy = relationship.target.y - relationship.source.y
        if ( node == relationship.source )
          dx = -dx
          dy = -dy

        angle = Math.atan2(dy, dx) / Math.PI * 180
        arrowAngles.floating[relationship.id] = (angle + 180) % 360

      distributedAngles = arrowAngles.floating
      if (relationships.length > 1)
        distributedAngles = neo.utils.distributeCircular(arrowAngles, 20)

      for id, angle of distributedAngles
        relationship = relationshipMap[id]
        if node == relationship.source
          relationship.sourceAngle = angle
          relationship.startPoint =
            x: relationship.source.x + Math.cos(angle * Math.PI / 180) * relationship.source.radius
            y: relationship.source.y + Math.sin(angle * Math.PI / 180) * relationship.source.radius
        if node == relationship.target
          relationship.targetAngle = angle
          relationship.endPoint =
            x: relationship.target.x + Math.cos(angle * Math.PI / 180) * relationship.target.radius
            y: relationship.target.y + Math.sin(angle * Math.PI / 180) * relationship.target.radius

    for relationship in graph.relationships()
      dx = relationship.endPoint.x - relationship.startPoint.x
      dy = relationship.endPoint.y - relationship.startPoint.y
      relationship.arrowLength = Math.sqrt(square(dx) + square(dy))
      alongPath = (from, distance) ->
        x: from.x + dx * distance / relationship.arrowLength
        y: from.y + dy * distance / relationship.arrowLength

      shaftRadius = (parseFloat(@style.forRelationship(relationship).get('shaft-width')) / 2) or 2
      headRadius = shaftRadius + 3
      headHeight = headRadius * 2
      shaftLength = relationship.arrowLength - headHeight
      relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2)
      relationship.angle = Math.atan2(dy, dx) / Math.PI * 180
      relationship.textAngle = relationship.angle
      if relationship.angle < -90 or relationship.angle > 90
        relationship.textAngle += 180

      [relationship.shortCaption, relationship.shortCaptionLength] = if shaftLength > relationship.captionLength
        [relationship.type, relationship.captionLength]
      else
        @shortenCaption(relationship, relationship.type, shaftLength)

      if relationship.captionLayout is "external"
        startBreak = (shaftLength - relationship.shortCaptionLength) / 2
        endBreak = shaftLength - startBreak

        relationship.arrowOutline = [
          'M', 0, shaftRadius,
          'L', startBreak, shaftRadius,
          'L', startBreak, -shaftRadius,
          'L', 0, -shaftRadius,
          'Z'
          'M', endBreak, shaftRadius,
          'L', shaftLength, shaftRadius,
          'L', shaftLength, headRadius,
          'L', relationship.arrowLength, 0,
          'L', shaftLength, -headRadius,
          'L', shaftLength, -shaftRadius,
          'L', endBreak, -shaftRadius,
          'Z'
        ].join(' ')
      else
        relationship.arrowOutline = [
          'M', 0, shaftRadius,
          'L', shaftLength, shaftRadius,
          'L', shaftLength, headRadius,
          'L', relationship.arrowLength, 0,
          'L', shaftLength, -headRadius,
          'L', shaftLength, -shaftRadius,
          'L', 0, -shaftRadius,
          'Z'
        ].join(' ')

  setNodeRadii: (nodes) ->
    for node in nodes
      node.radius = parseFloat(@style.forNode(node).get("diameter")) / 2


  onGraphChange: (graph) ->
    @setNodeRadii(graph.nodes())
    @formatNodeCaptions(graph.nodes())
    @measureRelationshipCaptions(graph.relationships())

  onTick: (graph) ->
    @layoutRelationships(graph)
