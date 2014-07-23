// Load Nigeria - Companies
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_companies_20140714.csv' AS line
WITH line
MERGE (company:Company {name: line.name}) ON MATCH SET company.other_names = coalesce(line.other_names,''), company.previous_names = coalesce(line.previous_names,''), company.oc_id = coalesce(line.oc_id, ''), company.headquarters = coalesce(line.oc_id,''), company.directors = coalesce(line.directors,''), company.shareholders = coalesce(line.shareholders,''), company.foundation_date = coalesce(line.foundation_date, ''), company.website = coalesce(line.website, ''), company.document = ''
WITH line, company
WHERE line.legal_type <> ''
MERGE (legaltype:LegalType {name: line.legal_type})
MERGE (company)-[haslegaltype:HAS_LEGAL_TYPE { source_url: coalesce(line.legal_type_source, ''), source_date: '', confidence: '', source_type:'' , log_message: ''}]->(legaltype)