// Load BP - Company/Country
LOAD CSV FROM 'https://raw.githubusercontent.com/iilab/openoil/master/data/BP%20Dataset%202014.05.28%20%28Full%20AR2013%20Scrape%20-%20edited%29%20-%20Sheet1.csv' AS line
MERGE (c:Company { name: line[0], corporateId: line[6], sourceURL: line[7], sourcePubDate: line[9]})
MERGE (p:Company { name: line[2]})
MERGE (j:Country { name: line[4]})
MERGE (c)-[r:DIRECT { immediate: line[1]}]->(p)
MERGE (c)-[s:JURISDICTION]->(j);