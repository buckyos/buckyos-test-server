const fs = require('fs');
const path = require('path');

fs.copyFileSync("client.js", "packages/client/client.js");

const clientFile = path.join(__dirname, '../packages/client/client.js');

// Ensure the directory exists
const clientDir = path.dirname(clientFile);
if (!fs.existsSync(clientDir)) {
  console.log(`Client directory does not exist: ${clientDir}`);
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(clientFile)) {
  console.log(`Client file does not exist: ${clientFile}`);
  process.exit(1);
}

let content = fs.readFileSync(clientFile, 'utf8');

if (!content.startsWith('#!/usr/bin/env node')) {
  content = '#!/usr/bin/env node\n' + content;
  fs.writeFileSync(clientFile, content);
  console.log('✓ Added shebang to packages/client/client.js');
} else {
  console.log('✓ Shebang already exists in packages/client/client.js');
}
