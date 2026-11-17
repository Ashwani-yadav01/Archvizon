const fs = require('fs');
const path = require('path');

const patterns = [
  { name: 'TODO/FIXME', regex: /\b(TODO|FIXME|HACK|XXX)\b/i },
  { name: 'setTimeout delay', regex: /setTimeout\s*\(/ },
  { name: 'Mock/Dummy data', regex: /\b(mock|dummy|fake|sampleData|fixtures?)\b/i },
  { name: 'Base64 1x1 image fixture', regex: /base64[',"]\s*\)|1x1|data:image\/gif;base64/i },
  { name: 'Simulate/Placeholder text', regex: /\b(simulate|simulation|placeholder)\b/i },
];

const results = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(js|jsx|ts|tsx|json|mjs)$/.test(file)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          for (const p of patterns) {
            if (p.regex.test(line)) {
              results.push({
                file: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
                line: index + 1,
                category: p.name,
                snippet: line.trim().slice(0, 120)
              });
            }
          }
        });
      } catch (e) {}
    }
  }
}

scanDir('frontend/src');
scanDir('backend/src');

console.log(JSON.stringify(results, null, 2));
