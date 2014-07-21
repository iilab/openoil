define(['elements/iilab-graph/iilab-graph', 'spec/support/helper'], function (startGraph, helper) {
  describe('<iilab-graph>', function () {
    var container;

    beforeEach(function () {
      container = document.createElement("div");
      container.innerHTML = __html__['test/iilab-graph/iilab-graph-fixture.html'];
      waits(0); // One event loop for elements to register in Polymer
    });

  describe('defaults', function(){
    beforeEach(function(){
      var it = document.getElementsByTagName('pricing-plan')[0];
    });

    it('should create an element', function() {
      expect(it).toNotBe(undefined);
    });
  });
});