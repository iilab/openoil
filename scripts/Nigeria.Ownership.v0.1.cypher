// Load Nigeria - Ownership
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_ownership_20140628.csv' AS line
WITH line
MERGE (company:Company { name: line.company })
MERGE (parent:Company { name: line.parent })
MERGE (parent)-[owns:IS_OWNER { immediate:coalesce(TOFLOAT(coalesce(replace(line.immediate, ',','.'),'0')),''), ultimate:'', ownership_type:line.ownership_type, start_date: line.start_date, end_date:line.end_date, source_url: line.source_url, source_date: line.source_date, confidence: line.confidence, source_type:'', log_message: line.log_message}]->(company)