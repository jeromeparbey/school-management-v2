// backend/scripts/add-schema-attributes.js
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../prisma/tenant-template.prisma');
let content = fs.readFileSync(templatePath, 'utf8');

// Regex : matcher les blocs `model X { ... }` et `enum Y { ... }`
// et vérifier la présence de @@schema avant la fermeture
const blocks = [
  { regex: /(model \w+ \{[^}]*?\n\})/g, kind: 'model' },
  { regex: /(enum \w+ \{[^}]*?\n\})/g, kind: 'enum' },
];

let count = 0;

blocks.forEach(({ regex }) => {
  content = content.replace(regex, (match) => {
    if (match.includes('@@schema')) {
      return match; // déjà présent
    }
    count++;
    // Insérer @@schema juste avant la dernière accolade
    const lines = match.split('\n');
    const closingIndex = lines.length - 1;
    // Trouver la ligne "}" finale
    let insertIdx = closingIndex;
    // Insérer avant la dernière ligne (qui doit être "}")
    lines.splice(insertIdx, 0, `  @@schema("\${SCHEMA_NAME}")`);
    return lines.join('\n');
  });
});

fs.writeFileSync(templatePath, content, 'utf8');
console.log(`✅ ${count} attributs @@schema ajoutés.`);