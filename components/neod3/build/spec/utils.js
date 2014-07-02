describe('neo.utils', function() {
  return describe('copy', function() {
    return it('copies an object', function() {
      var newObj, obj;
      obj = {
        b: {
          c: 1
        }
      };
      newObj = neo.utils.copy(obj);
      obj.b.c = 2;
      return expect(newObj.b.c).toBe(1);
    });
  });
});
