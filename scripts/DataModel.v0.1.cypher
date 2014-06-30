// Data Model - Latest
CREATE (parent:Company { name: 'Parent Company'})
CREATE (statecompany:Company { name: 'State Company'})
CREATE (company:Company { name: 'Company', other_names: 'Company other name', previous_names:'Company previous name', oc_id: 'gb/012345678', headquarters:'Company Headquarters address', directors:'company directors', shareholder:'company shareholders', founded_in:'1999', website:'https://example.com', document:'document'})
CREATE (contractor:Company { name: 'Contractor'})
CREATE (operator:Company { name: 'Operator'})
CREATE (bah:Country { name: 'Country'})
CREATE (nig:Country { name: 'Other Country'})
CREATE (llc:CompanyType { name:'Limited Liability Company'})
CREATE (servicecontract:Contract { name: 'Service Contract name', official_title:'', description:'', value_usd:'', value_currency_amount:'10000000', value_currency_unit: 'EUR', announcement_date:'2012-08', start_date:'2014', end_date: '', duration_months:'48', field:'', license_area:''})
CREATE (statprodcontract:Contract { name: 'State Production Contract name', official_title:'', description:'', value_usd:'', value_currency_amount:'10000000', value_currency_unit: 'EUR', announcement_date:'2012-08', start_date:'2014', end_date: '', duration_months:'48', field:'', license_area:''})
CREATE (prodcontract:Contract { name: 'Production Contract', official_title:'', description:'', value_usd:'', value_currency_amount:'10000000', value_currency_unit: 'EUR', announcement_date:'2012-08', start_date:'2014', end_date: '', duration_months:'48', field:'', license_area:''})

CREATE (productionsharingtype:ContractType { name:'Production Sharing Contract'})
CREATE (concessioncontracttype:ContractType { name:'Concession Contract'})
CREATE (primaryservicecontracttype:ContractType { name:'Primary Service Contract'})
CREATE (servicecontracttype:ContractType { name:'Service Contract'})

CREATE (doc:Document { name:'Document', summary: 'Something about it', raw:'More about it', file:'Some blob'})

//ContractType???
//Linking documents
CREATE (company)-[hasdoc:HAS_DOCUMENT]->(doc)
CREATE (servicecontract)-[hascontractdoc:HAS_DOCUMENT]->(doc)

// Relationships

// Factual

CREATE (parent)-[owns:IS_OWNER { immediate:'100', ultimate:'100', ownership_type:'', start_date:'', end_date:'', source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(company)

CREATE (company)-[jur:HAS_JURISDICTION {source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(bah)

// Company type

CREATE (company)-[hastype:HAS_TYPE {source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(llc)

// Service Contracts
CREATE (statecompany)-[:ISSUES {source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(statprodcontract)

CREATE (company)-[issuservice:ISSUES {source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(servicecontract)

CREATE (servicecontract)-[hascontr:HAS_CONTRACTOR {contract_share:'', source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(contractor)

CREATE (prodcontract)-[:HAS_CONTRACTOR {contract_share:'', source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(contractor)

CREATE (statprodcontract)-[:HAS_CONTRACTOR {contract_share:'', source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(contractor)


CREATE (servicecontract)-[haservicescontracttype:CONTRACT_TYPE {source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'', log_message: ''}]->(servicecontracttype)

// Production Sharing Contracts

// Country state issuing.

CREATE (nig)-[issuprodstate:ISSUES {source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(prodcontract)

CREATE (statprodcontract)-[hasoper:HAS_OPERATOR {contract_share:'', source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(operator)

CREATE (statprodcontract)-[hasstateprodcontracttype:CONTRACT_TYPE {source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'', log_message: ''}]->(productionsharingtype)

// State owned company issueing

CREATE (nig)-[stateowns:IS_OWNER { immediate:'100', ultimate:'100', ownership_type:'', start_date:'', end_date:'', source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(statecompany)

CREATE (statecompany)-[issu:ISSUES {source_url: 'http://www.nestoilgroup.com/projects.php', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(prodcontract)

CREATE (prodcontract)-[hasprodcontracttype:CONTRACT_TYPE {source_url: 'https://opencorporates.com/companies/gb/01004984', source_date: '2014-05-15', confidence: 'high', source_type:'secondary', log_message: ''}]->(productionsharingtype)