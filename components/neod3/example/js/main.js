d3.xhr("data/style.grass", "application/grass", function(request){
  drawGraph(request.responseText);
});

//drawGraph($('#grass').innerText);

var drawGraph = function(styleContents) {
  var graphView = neo.graphView()
    .style(styleContents)
    .width(1280)
    .on('nodeClicked', function(node){
      graphModel.nodes.remove(node.id);
    })
    .on('nodeDblClicked', function(node){
      var id = Math.round(Math.random() * 10000);
      graphModel.nodes.add({id: id, labels: ['Goonie'], properties: {name: "Goonie"}});
      graphModel.relationships.add({id: id, source: node.id, target: id, type: 'SPAWNS'});
    })
    .on('relationshipClicked', function(relationship){
      graphModel.relationships.remove(relationship.id);
    })
  ;

  var graphModel = neo.graphModel()
    .nodes([
      {id: 0, labels: ['Person', 'Gamer'], properties: {name: "Johan"}},
      {id: 1, labels: ['Person'], properties: {name: "Sebastian"}},
      {id: 2, labels: ['Thing'], properties: {name: "Nintendo"}}
    ])
    .relationships([
      {id: 0, source: 0, target: 2, type: 'PLAYS'},
      {id: 1, source: 1, target: 2, type: 'OWNS', properties: {since: "1991"}}
    ])

  d3.select("#example")
    .data([graphModel])
    .call(graphView);

  setTimeout(function(){
    graphModel.nodes.add({id: 3, labels: ['Thing'], properties: {name: "Sega"}})
    graphModel.relationships.add({id: 2, source: 0, target: 3, type: 'HATES'})
  }, 1000)
}
