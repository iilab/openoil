# neod3

Graph visualisation library for [D3.js](http://d3js.org/). This library an high-level abstraction of D3 graph rendering that let you produce beautiful, interactive graphs without having to know all the details.

## Installation

### Install from source

```bash
npm install
grunt build
```

### Include the script
Include neod3.js somewhere after you've loaded d3.js. If you're using Bower it looks something like this:

```html
<script src="components/neod3/neod3.js"></script>
```

## Usage

The library primarily consists of two parts; **graphModel**, responsible for working with node and relationship data. And **graphView**, responsible for rendering and interacting with the graph.

Here's a minimal example that renders a graph with two *nodes* connected by a *relationship*:

```javascript
var graphModel = neo.graphModel()
  .nodes([
    {id: 0, labels: ['Person', 'Gamer'], properties: {name: "Johan"}},
    {id: 1, labels: ['Person'], properties: {name: "Sebastian"}}
  ])
  .relationships([
    {id: 0, source: 0, target: 1, type: 'KNOWS'}
  ])

var graphView = neo.graphView();

// Make sure you put an element with id=example in your DOM
d3.select("#example").datum(graphModel).call(graphView);
```

Let's add some interaction by adding a click handler to the graphView. The `node` argument is an instance of **neo.model.Node**. In this example, when a node is clicked, we create a new node, connect it with a relationship, and add it to the graph model. Either instantiate a new neo.model.Node, or use raw objects as we did in the initialization. The graphView listens to changes made to it's graphModel in the event handlers and automatically redraws the graph.

```javascript
var graphView = neo.graphView()
  .on('nodeClicked', function(node) {
    // Use objects as argument, e.g. neo.model.Node
    graphModel.nodes.add(new neo.model.Node(3, ['Person', 'Wannabe'], {name: 'Joel'}));

    // ...or use raw data
    graphModel.relationships.add({id: 2, source: node.id, target: 3, type: 'KNOWS'});
  })
;
```

Note that all calls are chainable so you can just keep adding handlers. Let's add one that removes a relationship when clicked, and removes a node when double-clicked. Note that `remove` accepts both  identifiers and objects.

```javascript
  })
  .on('onRelationshipClicked', function(relationship) {
    graphModel.relationships.remove(relationship);
  })
  .on('onNodeDblClicked', function(node) {
    graphModel.nodes.remove(node.id);
  })
;
```

So far we've rendered the graph with the build-in default styling. Let's add some custom styling by loading a GraSS stylesheet. First create the stylesheet:

```css
/* style.grass */
node {
  diameter: 40px;
  color: #DFE1E3;
  border-color: #D4D6D7;
  border-width: 2px;
  text-color-internal: #000000;
  caption: '{name}';
  font-size: 10px;
}

relationship {
  color: #D4D6D7;
  shaft-width: 1px;
  font-size: 8px;
  padding: 3px;
  text-color-external: #000000;
  text-color-internal: #FFFFFF;
}
```

In this example we load the stylesheet from your server. Since loading of files is performed asynchronously, we'll need to do the initialization in the XHR response callback.

```javascript
d3.xhr("style.grass", "application/grass", function(request) {
  var graphView = neo.graphView()
    // .on( ...
    .style(request.responseText)
  ;

  d3.select("#example").datum(graphModel).call(graphView);
});
```

## Develop

### Run the development server

```bash
grunt server
open http://localhost:4567
```

### Testing

To run tests continously in the background, first start the server (`grunt server`) and then:

```bash
karma start
```

To run tests once

```bash
grunt test
```


# License

Please see the included license.txt