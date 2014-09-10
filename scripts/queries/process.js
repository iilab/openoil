// Use with node process.js $input_file [> $output_file]

var fs = require('fs');
var file = __dirname + '/' + process.argv[2];
var myjson = {nodes:[], links:[]};
var baseUrl = "https://neo4j.openoil.net/db/data/"
 
fs.readFile(file, 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
 
  data = JSON.parse(data);

  myjson.nodes = data.data[0][0].nodes
                 .map(function(row) {
                      return {
                          id: row.id,
                          labels: row.label,
                          properties: row.node.data
                      };
                  });


  myjson.links = data.data[0][0].links
                 .map(function(r) {
                      var caption, weight, size
                      if (r.type == "IS_OWNER") {
                        caption = 'Owns ' + r.data.immediate + "%"
                        weight = r.data.immediate/10        
                        size= "18px";
                      } else if (r.type == "HAS_CONTRACTOR") {
                        if (r.data.contract_share) {
                          caption = 'Contractor ' + r.data.contract_share + '%'
                          weight = r.data.contract_share/5
                          size= "18px";
                        } else {
                          caption = 'Contractor'
                          weight = 1
                          size= "18px";
                        }
                      } else if (r.type == "HAS_OPERATOR") {
                        caption = 'Operator ' + r.data.contract_share + '%'
                        weight = r.data.contract_share/5
                        size= "18px";
                      } else if (r.type == "AWARDS") {
                        caption = 'Awards'
                        weight = 1
                        size= "18px";
                      } else if (r.type == "HAS_JURISDICTION") {
                        caption = 'Jurisdiction'
                        weight = 1
                        size= "18px";
                      } else {
                        caption = r.type;
                        size= "10px";
                        weight = 1
                      }
                      return {
                          id: r.self.replace(baseUrl + "relationship/",""),
                          source: r.start.replace(baseUrl + "node/",""),
                          target: r.end.replace(baseUrl + "node/",""),
                          type: r.type,
                          caption: caption,
                          size: size,
                          weight: weight,
                          properties: r.data
                      };
                  });
   
   console.log(myjson);

});


