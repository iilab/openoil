// Load Nigeria - Companies / Jurisdictions
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_companies_20140714.csv' AS line
WITH line
MERGE (company:Company {name: line.name})
MERGE (country:Country { name: line.jurisdiction})
WITH line, country, company
WHERE line.jurisdiction <> ''
MERGE (company)-[s:HAS_JURISDICTION { source_url: coalesce(line.jurisdiction_source,'')}]->(country)