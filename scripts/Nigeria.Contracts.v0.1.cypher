// Load Nigeria - Contracts
LOAD CSV WITH HEADERS FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/Nigeria_contracts_20140711.csv' AS line
MERGE (source:Company { name: line.company_source } )
MERGE (contract:Contract { name: line.name, official_title: coalesce(line.offical_title, ""), description:line.description, value_usd:coalesce(TOFLOAT(replace(line.value_usd,",","")),''), value_currency_amount:coalesce(TOFLOAT(replace(line.value_currency_amount,",","")),''), value_currency_unit: line.value_currency_unit, announcement_date: coalesce(line.announcement_date,""), start_date:line.start_date, end_date: line.end_date, duration_months:line.duration_months, field:line.field, license_area:line.license_area})
MERGE (contracttype:ContractType { name: line.type } )
MERGE (source)-[awardscontract:AWARDS {source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(contract)
MERGE (contract)-[hascontracttype:HAS_CONTRACT_TYPE {source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(contracttype)
FOREACH(target_name IN (CASE WHEN line.company_target <> "" THEN [line.company_target] ELSE [] END) |
    MERGE (target:Company { name: target_name } )
    MERGE (contract)-[hascontractor:HAS_CONTRACTOR {contract_share:line.share, source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(target)
)
FOREACH(operator_name IN (CASE WHEN line.operator <> "" THEN [line.operator] ELSE [] END) |
    MERGE (operator:Company { name: operator_name } )
    MERGE (contract)-[hasoperator:HAS_OPERATOR {contract_share:line.share, source_url: line.source_url, source_date: line.source_date, confidence: coalesce(line.confidence,"Low"), source_type:'' , log_message: line.log_message}]->(operator)
)
