// Work in progress

MATCH p=(n)-[r]-() WHERE NOT "Request" IN labels(n) UNWIND nodes(p) as nodes UNWIND relationships(p) as links 
RETURN 
  {
    "@context": {
      "organization": "http://schema.org/organization", 
      "oc_id": {
        "@id": "http://opencorporates.com",  ← This means that 'image' is shorthand for 'http://schema.org/image' 
        "@type": "@id"  ← This means that a string value associated with 'image' should be interpreted as an identifier that is an IRI 
      },
      "website": {
        "@id": "http://schema.org/url",  ← This means that 'homepage' is shorthand for 'http://schema.org/url' 
        "@type": "@id"  ← This means that a string value associated with 'homepage' should be interpreted as an identifier that is an IRI 
      },
      "dc": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex:contains": {
        "@type": "@id"
      }
    },
    "@graph":
      [ x in collect(DISTINCT nodes) | 
      CASE
        WHEN "Company" IN labels(x) THEN
        {
          "@id": 'https://data.openoil.net/companies/' + id(x)
          node: x,
          label: labels(x),
          oc_id: 'https://opencorporates.com/companies/' + oc_id,

        }
        WHEN "Contract" IN labels(x) THEN
        WHEN "Jurisdiction" IN labels(x) THEN

        ]
    , 
    links: 
      [ y in collect(DISTINCT links) | 
      {
        link: id(y),
        source: startNode(y), 
        target: endNode(y), 
        label: labels(x)
      }]
  } as result