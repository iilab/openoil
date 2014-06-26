// Load Nigeria - Contracts
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria%20-%20Contracts%20-%20No%20Prod.csv' AS line
MERGE (source:Company { name: line.company_source } )
MERGE (target:Company { name: line.company_target } )
MERGE (contracttype:ContractType { name: line.type } )
CREATE (contract:Contract { name: line.name, official_title: line.offical_title, description:line.description, value_usd:line.value_usd, value_currency_amount:line.value_currency_amount, value_currency_unit: line.value_currency_unit, announcement_date: line.announcement_date, start_date:line.start_date, end_date: line.end_date, duration_months:line.duration_months, field:line.field, license_area:line.license_area})
CREATE (source)-[issuescontract:ISSUES {source_url: line.source_url, source_date: line.source_date, confidence: line.confidence, source_type:'' , log_message: line.log_message}]->(contract)
CREATE (contract)-[hascontractor:HAS_CONTRACTOR {contract_share:line.share, source_url: line.source_url, source_date: line.source_date, confidence: line.confidence, source_type:'' , log_message: line.log_message}]->(target)
CREATE (contract)-[hascontracttype:CONTRACT_TYPE {source_url: line.source_url, source_date: line.source_date, confidence: line.confidence, source_type:'' , log_message: line.log_message}]->(contracttype)