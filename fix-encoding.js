const fs = require('fs');
const path = require('path');

const fixes = {
  'Ã©': 'é', 'Ã¨': 'è', 'Ãª': 'ê', 'Ã«': 'ë',
  'Ã ': 'à', 'Ã¢': 'â', 'Ã¤': 'ä',
  'Ã§': 'ç', 'Ã®': 'î', 'Ã¯': 'ï',
  'Ã´': 'ô', 'Ã¶': 'ö',
  'Ã¹': 'ù', 'Ã»': 'û', 'Ã¼': 'ü',
  'Ã‰': 'É', 'Ãˆ': 'È', 'ÃŠ': 'Ê',
  'Ã€': 'À', 'Ã‚': 'Â', 'Ã‡': 'Ç',
  'ÃŽ': 'Î', 'Ã™': 'Ù', 'Ã›': 'Û',
  'â€™': \"'\", 'â€œ': '\"', 'â€': '\"',
  'â€"': '—', 'â€"': '–', 'â€¦': '…',
  'Â°': '°', 'Â«': '«', 'Â»': '»'
};

function walk(dir) {
  const files = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.next')) {
        files.push(...walk(full));
      }
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      files.push(full);
    }
  });
  return files;
}

let count = 0;
const dirs = ['app', 'components', 'lib', 'types'];
dirs.forEach(d => {
  if (!fs.existsSync(d)) return;
  walk(d).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    Object.entries(fixes).forEach(([from, to]) => {
      content = content.split(from).join(to);
    });
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('OK:', file);
      count++;
    }
  });
});

console.log('\n' + count + ' fichier(s) corrigé(s)');
