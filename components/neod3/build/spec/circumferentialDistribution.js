describe('circumferentialDistribution', function() {
  it('should leave arrows alone that are far enough apart', function() {
    var arrowsThatAreAlreadyFarEnoughApart, result;
    arrowsThatAreAlreadyFarEnoughApart = {
      0: 0,
      1: 120,
      2: 240
    };
    result = neo.utils.distributeCircular({
      floating: arrowsThatAreAlreadyFarEnoughApart,
      fixed: {}
    }, 20);
    return expect(result).toEqual(arrowsThatAreAlreadyFarEnoughApart);
  });
  it('should spread out 2 arrows that are at exactly the same angle', function() {
    var arrowsThatAreTooCloseTogether, result;
    arrowsThatAreTooCloseTogether = {
      0: 0,
      1: 0
    };
    result = neo.utils.distributeCircular({
      floating: arrowsThatAreTooCloseTogether,
      fixed: {}
    }, 20);
    return expect(result).toEqual({
      0: 350,
      1: 10
    });
  });
  it('should spread out 3 arrows that are at exactly the same angle', function() {
    var arrowsThatAreTooCloseTogether, result;
    arrowsThatAreTooCloseTogether = {
      0: 0,
      1: 0,
      2: 0
    };
    result = neo.utils.distributeCircular({
      floating: arrowsThatAreTooCloseTogether,
      fixed: {}
    }, 20);
    return expect(result).toEqual({
      0: 340,
      1: 0,
      2: 20
    });
  });
  it('should spread out arrows that are too close together', function() {
    var arrowsThatAreTooCloseTogether, result;
    arrowsThatAreTooCloseTogether = {
      0: 160,
      1: 170,
      2: 180,
      3: 190,
      4: 200
    };
    result = neo.utils.distributeCircular({
      floating: arrowsThatAreTooCloseTogether,
      fixed: {}
    }, 20);
    return expect(result).toEqual({
      0: 140,
      1: 160,
      2: 180,
      3: 200,
      4: 220
    });
  });
  it('should spread out arrows that are too close together, wrapping across 0 degrees', function() {
    var arrowsThatAreTooCloseTogether, result;
    arrowsThatAreTooCloseTogether = {
      0: 340,
      1: 350,
      2: 0,
      3: 10,
      4: 20
    };
    result = neo.utils.distributeCircular({
      floating: arrowsThatAreTooCloseTogether,
      fixed: {}
    }, 20);
    return expect(result).toEqual({
      0: 320,
      1: 340,
      2: 0,
      3: 20,
      4: 40
    });
  });
  return it('should leave arrows alone whose positions have already been fixed, and distribute between them', function() {});
});
