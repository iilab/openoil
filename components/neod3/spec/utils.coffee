describe 'neo.utils', ->
  describe 'copy', ->
    it 'copies an object', ->
      obj = {b: {c: 1}}
      newObj = neo.utils.copy(obj)
      obj.b.c = 2

      expect(newObj.b.c).toBe 1

