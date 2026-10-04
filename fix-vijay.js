const fs = require('fs');
let c = fs.readFileSync('streams/in.m3u', 'utf8');

// The working urls
const workingVijay = [
  '#EXTINF:-1 tvg-id="StarVijay.in@SD",Star Vijay (576p)\nhttp://ptuf.ridsys.in/riptv/live/STAR_VIJAY/index.m3u8',
  '#EXTINF:-1 tvg-id="VijaySuper.in@SD",Vijay Super (576p)\nhttp://ptuf.ridsys.in/riptv/live/VIJAY_SUPER/index.m3u8'
];

// Remove all existing vijay entries so we don't have duplicates or broken ones
const lines = c.split(/\r?\n/);
const newLines = [];
let skipNext = false;
for (let i = 0; i < lines.length; i++) {
  if (skipNext) {
    skipNext = false;
    continue;
  }
  if (lines[i].toLowerCase().includes('vijay')) {
    if (lines[i].startsWith('#EXTINF')) {
      skipNext = true; // skip the url line too
      continue;
    }
  }
  newLines.push(lines[i]);
}

// Add the working ones at the top, after #EXTM3U
let out = '';
if (newLines[0].startsWith('#EXTM3U')) {
  out = newLines[0] + '\n' + workingVijay.join('\n') + '\n' + newLines.slice(1).join('\n');
} else {
  out = '#EXTM3U\n' + workingVijay.join('\n') + '\n' + newLines.join('\n');
}

fs.writeFileSync('streams/in.m3u', out);
