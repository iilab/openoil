// Show relationships between BP and Nigeria 
MATCH (c:Country {name: 'Nigeria'})<-[:HAS_JURISDICTION]-(company:Company)-[r:IS_OWNER*..10]-(bp:Company {name:'BP P L C'}) RETURN c,r,company, bp