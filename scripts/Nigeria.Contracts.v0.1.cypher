// Load Nigeria - Contracts
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_contracts_20140628.csv' AS line
WITH line
MERGE (source:Company { name: line.company_source } )
MERGE (target:Company { name: line.company_target } )
MERGE (contracttype:ContractType { name: line.type } )
MERGE (contract:Contract { name: line.name, official_title: coalesce(line.offical_title, ""), description:line.description, value_usd:coalesce(TOFLOAT(replace(line.value_usd,",","")),''), value_currency_amount:coalesce(TOFLOAT(replace(line.value_currency_amount,",","")),''), value_currency_unit: line.value_currency_unit, announcement_date: coalesce(line.announcement_date,""), start_date:line.start_date, end_date: line.end_date, duration_months:line.duration_months, field:line.field, license_area:line.license_area})
MERGE (source)-[issuescontract:ISSUES {source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(contract)
MERGE (contract)-[hascontractor:HAS_CONTRACTOR {contract_share:line.share, source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(target)
MERGE (contract)-[hascontracttype:CONTRACT_TYPE {source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(contracttype)