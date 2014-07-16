MATCH (n {name: 'Shell Petroleum Development Company of Nigeria Limited (SPDC)'})<-[r:`IS_OWNER`]-(b) RETURN n,r UNION MATCH (b {name: 'Shell Petroleum Development Company of Nigeria Limited (SPDC)'})<-[r:`IS_OWNER`]-(n) RETURN n, r

MATCH (a)-[r:IS_OWNER]-(b) WITH a, r, b LIMIT 200 WITH { id: LOWER(REPLACE(a.name, ' ', '_')), labels: ['Company'], properties: {name: a.name, oc_id: a.ID} } as nodea, {id: LOWER(REPLACE(a.name + ' ' + b.name, ' ', '_')), source: LOWER(REPLACE(a.name, ' ', '_')), target: LOWER(REPLACE(b.name, ' ', '_')), type: 'IS_OWNER', properties: { immediate: r.immediate}} as link,b WITH {id: LOWER(REPLACE(b.name, ' ', '_')), labels: ['Company'], properties: { name: b.name, oc_id: b.ID} } as nodeb, nodea, link RETURN {nodes: collect(DISTINCT nodea) + collect(DISTINCT nodeb), links: collect(DISTINCT link)} AS json

MATCH p=(company:Company)-[r:IS_OWNER*..3]-(a {name: 'Shell Nigeria Exploration and Production Company (SNEPCO)'})-[:AWARDS|HAS_OPERATOR]-(c)-[:HAS_CONTRACTOR|HAS_OPERATOR]-(d)
WHERE id(d)<>635603
RETURN collect(DISTINCT nodes(p)) as nodes, collect(DISTINCT relationships(p)) as links