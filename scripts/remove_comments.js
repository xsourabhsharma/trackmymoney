const fs = require('fs');
const path = require('path');

function removeComments(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that shouldn't be touched or are outside src
  if (filePath.includes('.next') || filePath.includes('node_modules') || !filePath.includes('src')) return;

  // Removing JS/TS single line comments (//) and multi-line comments (/* */)
  // Be careful not to remove URLs like http://
  // Regular expression to safely remove comments
  // This is a basic regex that works for most JS/TS files but may have edge cases with strings
  
  const original = content;

  // Remove single line comments that start with // (but not inside URLs)
  content = content.replace(/(?:^|\s)\/\/(?!.*(?:http|https)).*$/gm, '');
  
  // Remove multi-line comments /* ... */
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove JSX/TSX comments {/* ... */}
  content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

function traverseAndClean(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        traverseAndClean(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      removeComments(fullPath);
    }
  }
}

console.log('Starting comment removal...');
traverseAndClean(path.join(process.cwd(), 'src'));
console.log('Comment removal complete.');
