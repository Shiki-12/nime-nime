const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '../src/app'),
    path.join(__dirname, '../src/components'),
];

const patterns = [
    // Backgrounds
    { rx: /bg-white\/\[0\.03\]/g, to: 'bg-hn-card' },
    { rx: /bg-white\/\[0\.05\]/g, to: 'bg-hn-card-hover' },
    { rx: /bg-white\/\[0\.06\]/g, to: 'bg-hn-border/20' }, // sometimes used as subtle bg
    // Borders
    { rx: /border-white\/\[0\.06\]/g, to: 'border-hn-border/50' },
    { rx: /border-white\/\[0\.08\]/g, to: 'border-hn-border/60' },
    // Text Opacity
    { rx: /text-gray-200/g, to: 'text-hn-text' },
    { rx: /text-gray-300/g, to: 'text-hn-text-muted/60' },
    { rx: /text-gray-400/g, to: 'text-hn-text-muted/70' },
    { rx: /text-gray-500/g, to: 'text-hn-text-muted/80' },
    { rx: /text-white\/10/g, to: 'text-hn-text-muted/30' },
    { rx: /text-white\/20/g, to: 'text-hn-text-muted/40' },
    { rx: /text-white\/30/g, to: 'text-hn-text-muted/50' },
    { rx: /text-white\/40/g, to: 'text-hn-text-muted/60' },
    { rx: /text-white\/50/g, to: 'text-hn-text-muted/70' },
    { rx: /text-white\/60/g, to: 'text-hn-text-muted/80' },
    { rx: /text-white\/80/g, to: 'text-hn-text-muted/90' },
    { rx: /text-white\/90/g, to: 'text-hn-text' },
    // Text Primary
    { rx: /\btext-white\b/g, to: 'text-hn-text' },
    { rx: /\btext-gray-50\b|\btext-gray-100\b/g, to: 'text-hn-text' },
    // Background Grays
    { rx: /\bbg-gray-800\b/g, to: 'bg-hn-card' },
    { rx: /\bbg-gray-900\b/g, to: 'bg-hn-body' },
    // bg-black but NOT bg-black/[X] (User wants to keep modal backdrops which have opacity)
    // Wait, the user said keep bg-black/[opacity]. Let's replace ONLY bg-black if it has no opacity, 
    // but honestly admin layout might have bg-black without opacity. Let's check regex so we don't match bg-black/50
    { rx: /\bbg-black\b(?!\/)/g, to: 'bg-hn-body' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const { rx, to } of patterns) {
                content = content.replace(rx, to);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Modified:', fullPath);
            }
        }
    }
}

for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}

console.log('Done.');
