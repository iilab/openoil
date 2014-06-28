// Load Nigeria - Companies
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_companies_20140628.csv' AS line
WITH line
MERGE (n:Company {name: coalesce(line.name,split(coalesce(line.other_names,''), ',')[0]), other_names: coalesce(line.other_names,''), previous_names: coalesce(line.previous_names,''), oc_id: line.oc_id, headquarters:line.oc_id, directors:line.directors, shareholders:line.shareholders, foundation_date:line.foundation_date, website:line.website, document:''})
WITH line, n
WHERE line.legal_type <> ''
MERGE (lt:LegalType {name: line.legal_type})
MERGE (n)-[haslegaltype:HAS_LEGAL_TYPE { source_url: coalesce(line.legal_type_source, ''), source_date: '', confidence: '', source_type:'' , log_message: ''}]->(lt)