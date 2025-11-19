const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'questions.json');
if(!fs.existsSync(dataPath)){
  console.error('data/questions.json not found'); process.exit(1);
}
const all = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
for(const exam of Object.keys(all)){
  const outPath = path.join(__dirname, '..', 'data', `${exam}.json`);
  fs.writeFileSync(outPath, JSON.stringify(all[exam], null, 2), 'utf8');
  console.log('Wrote', outPath);
}
console.log('Split complete');
