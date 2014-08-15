// Load BP - with Sources
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/BP_ownership_20140713.csv' AS line
WITH line
MERGE (parent:Company { name: line.parent })
MERGE (company:Company { name: line.company }) ON MATCH SET company.oc_id = line.oc_id, company.source_url = line.source_url, company.source_date = line.source_date, company.confidence = line.confidence
MERGE (parent)-[owns:IS_OWNER { immediate:coalesce(TOFLOAT(coalesce(replace(line.immediate, ',','.'),'0')),0), ultimate: coalesce(TOFLOAT(coalesce(replace(line.ultimate, ',','.'),'0')),0), ownership_type:line.ownership_type, ownership_status: line.ownership_status, start_date: line.start_date, end_date:line.end_date, turnover:line.turnover, profit:line.profit, assets:line.assets, liabilities:line.liabilities, source_url: line.source_url, source_date: line.source_date, confidence: line.confidence, source_type:'', log_message: coalesce(line.log_message,'')}]->(company)
MERGE (country:Country { name: line.jurisdiction})
MERGE (company)-[s:HAS_JURISDICTION { source_url: line.source_url, source_date: line.source_date, confidence: line.confidence } ]->(country);