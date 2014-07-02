class neo.models.Node
  constructor: (@id, @labels, properties) ->
    @propertyMap = properties
    @propertyList = for own key,value of properties
        { key: key, value: value }

  toJSON: ->
    @propertyMap

  isNode: true
  isRelationship: false