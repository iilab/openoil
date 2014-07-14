// Load World ID for Datamap
// from http://www.opengeocode.org/cude/download.php?file=/home/fashions/public_html/opengeocode.org/download/cow.txt
LOAD CSV WITH HEADERS FROM 'file:///Users/jun/dev/OpenOil/openoil/data/countries.csv' AS line FIELDTERMINATOR ';' 
WITH line
MERGE (c:Country { name: line.`ISOen_name` }) ON MATCH SET c.id = line.ISO3166A3, c.latitude = line.latitude, c.longitude = line.longitude