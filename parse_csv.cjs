const fs = require('fs');

const csv = fs.readFileSync('Revistas 2026-3 Barrera (1).csv', 'utf-8');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith(',,,'));
const headersLine = lines.shift();

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

const headers = parseLine(headersLine).map(h => h.trim());

const data = lines.map((line, idx) => {
  const values = parseLine(line);
  const obj = { id: Date.now() + idx };
  headers.forEach((h, i) => {
    obj[h] = values[i] ? values[i].trim() : '';
  });
  return obj;
});

fs.writeFileSync('src/data.json', JSON.stringify(data, null, 2));
console.log('Parsed', data.length, 'journals');
