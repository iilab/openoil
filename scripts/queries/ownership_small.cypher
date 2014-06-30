// Immediate Ownership below 5%
MATCH ()-[n:IS_OWNER]->() where n.immediate < 5 return n;