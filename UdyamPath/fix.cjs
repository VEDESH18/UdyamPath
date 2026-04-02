const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(filePath));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Using a simple replace all
    content = content.replace(/\\\`/g, '`');
    content = content.replace(/\\\$\{/g, '${');
    content = content.replace(/\\\\n/g, '\\n');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log('Fixed:', file);
    }
});
console.log('Fixed ' + changed + ' files.');
