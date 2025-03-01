import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure the public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// The SVG content
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3B82F6" rx="128"/>
  <g transform="translate(128, 128) scale(0.5)">
    <rect x="32" y="32" width="448" height="448" rx="32" fill="white"/>
    <path d="M 96 256 L 224 384 L 416 192" 
          stroke="#3B82F6" 
          stroke-width="48" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
  </g>
</svg>`;

// Save as icon-512.svg
fs.writeFileSync(path.join('public', 'icon-512.svg'), svgContent);

// Modify viewBox for 192x192 version
const icon192 = svgContent.replace('viewBox="0 0 512 512"', 'viewBox="0 0 192 192"');
fs.writeFileSync(path.join('public', 'icon-192.svg'), icon192);

console.log('Icons generated successfully!');