// Load Nigeria - Companies
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_companies_20140807.csv' AS line
WITH line
MERGE (company:Company {name: line.name}) 
ON MATCH SET company.other_names = coalesce(line.other_names,''), company.previous_names = coalesce(line.previous_names,''), company.oc_id = coalesce(line.oc_id, ''), company.headquarters = coalesce(line.oc_id,''), company.directors = coalesce(line.directors,''), company.shareholders = coalesce(line.shareholders,''), company.foundation_date = coalesce(line.foundation_date, ''), company.website = coalesce(line.website, ''), company.document_filename = coalesce(line.document_filename,''), company.document_summary = coalesce(line.document_summary, ''), company.document_raw = coalesce(line.document_raw, '')
ON CREATE SET company.other_names = coalesce(line.other_names,''), company.previous_names = coalesce(line.previous_names,''), company.oc_id = coalesce(line.oc_id, ''), company.headquarters = coalesce(line.oc_id,''), company.directors = coalesce(line.directors,''), company.shareholders = coalesce(line.shareholders,''), company.foundation_date = coalesce(line.foundation_date, ''), company.website = coalesce(line.website, ''), company.document_filename = coalesce(line.document_filename,''), company.document_summary = coalesce(line.document_summary, ''), company.document_raw = coalesce(line.document_raw, '')
FOREACH(legal_type IN (CASE WHEN line.legal_type <> "" THEN [line.legal_type] ELSE [] END) |
    MERGE (legaltype:LegaType {name: legal_type})
	MERGE (company)-[haslegaltype:HAS_LEGAL_TYPE { source_url: coalesce(line.legal_type_source, ''), source_date: '', confidence: '', source_type:'' , log_message: ''}]->(legaltype)
)
FOREACH(jurisction_name IN (CASE WHEN line.jurisdiction <> "" THEN [line.jurisdiction] ELSE [] END) |
    MERGE (country:Country { name: line.jurisdiction})
    MERGE (company)-[s:HAS_JURISDICTION { source_url: coalesce(line.jurisdiction_source,'')}]->(country)
)