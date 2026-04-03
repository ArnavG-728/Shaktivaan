const fs = require('fs');
const path = require('path');
const dir = './src/data/plans';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/label:\s*'([^']+?)\s*\([^)]+\)'/g, "label: '$1'");
  fs.writeFileSync(p, content);
});
console.log('Fixed labels');
