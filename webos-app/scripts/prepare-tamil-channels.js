/**
 * prepare-tamil-channels.js
 * Merges and organizes all Indian and Tamil channels, putting Tamil channels first!
 */

const fs = require('fs');
const path = require('path');

const streamsDir = path.resolve(__dirname, '../../streams');
const dataDir = path.resolve(__dirname, '../data');

fs.mkdirSync(dataDir, { recursive: true });

const inFilePath = path.join(streamsDir, 'in.m3u');
let inContent = fs.existsSync(inFilePath) ? fs.readFileSync(inFilePath, 'utf8') : '';

// Verified working Tamil channels to place at the very top
const priorityTamilChannels = [
  {
    info: '#EXTINF:-1 tvg-id="DDTamil.in@SD" tvg-name="DD Tamil HD" tvg-logo="https://i.imgur.com/Yh3265D.png" group-title="Tamil",DD Tamil HD (1080p)',
    url: 'https://d2lk5u59tns74c.cloudfront.net/out/v1/abf46b14847e45499f4a47f3a9afe93d/index.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="PuthiyaThalaimurai.in@SD" tvg-name="Puthiya Thalaimurai" group-title="Tamil",Puthiya Thalaimurai News (576p)',
    url: 'https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="News18TamilNadu.in@SD" tvg-name="News18 Tamil Nadu" group-title="Tamil",News18 Tamil Nadu (1080p)',
    url: 'https://n18syndication.akamaized.net/bpk-tv/News18_Tamil_Nadu_NW18_MOB/output01/master.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="News7Tamil.in@SD" tvg-name="News 7 Tamil" group-title="Tamil",News 7 Tamil (576p)',
    url: 'https://segment.yuppcdn.net/240122/news7/playlist.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="KalaignarTV.in@SD" tvg-name="Kalaignar TV" group-title="Tamil",Kalaignar TV (396p)',
    url: 'https://segment.yuppcdn.net/240122/kalaignartv/playlist.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="RajTV.in@SD" tvg-name="Raj TV HD" group-title="Tamil",Raj TV HD (1080p)',
    url: 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/2839e3d1e0f84a2e821c1708d5fdfdf0/index.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="RajDigitalPlus.in@SD" tvg-name="Raj Digital Plus" group-title="Tamil",Raj Digital Plus (1080p)',
    url: 'https://livestream.rajtv.tv/hlslive/Admin/px08241087/live/RajTV_Digital_plus/master_1.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="AasthaTamil.in@SD" tvg-name="Aastha Tamil" group-title="Tamil",Aastha Tamil (480p)',
    url: 'https://aasthaott.akamaized.net/110923/smil:aasthatamil.smil/playlist.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="MediacorpTamil.in@HD" tvg-name="Mediacorp Tamil HD" group-title="Tamil",Mediacorp Entertainment Tamil (1080p)',
    url: 'https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/mediacorp-entertainment-tamil/manifest.m3u8?ads.vf=7NuondEN9pK'
  },
  {
    info: '#EXTINF:-1 tvg-id="ShakthiTV.lk@SD" tvg-name="Shakthi TV Tamil" group-title="Tamil",Shakthi TV Tamil (360p)',
    url: 'https://edge4-moblive.yuppcdn.net/transsd/smil:saktv10.smil/playlist.m3u8?dvr='
  },
  {
    info: '#EXTINF:-1 tvg-id="VasanthamTV.lk@SD" tvg-name="Vasantham TV Tamil" group-title="Tamil",Vasantham TV Tamil (720p)',
    url: 'https://j78dp2pnlq5r-hls-live.comcities.net/ITNDigital/20a317b0496a4930b375290505e5d628.sdp/playlist_dvr.m3u8'
  },
  {
    info: '#EXTINF:-1 tvg-id="StarTamilTelevision.lk@SD" tvg-name="Star Tamil TV" group-title="Tamil",Star Tamil Television (360p)',
    url: 'https://edge4-moblive.yuppcdn.net/trans1sd/smil:strtml19.smil/playlist.m3u8?dvr='
  }
];

// Helper to test if channel is Tamil
function isTamilChannel(info, url) {
  const s = (info + ' ' + url).toLowerCase();
  return s.includes('tamil') || s.includes('puthiya') || s.includes('kalaignar') || 
         s.includes('thanthi') || s.includes('polimer') || s.includes('raj tv') ||
         s.includes('raj digital') || s.includes('raj musix') || s.includes('captain') ||
         s.includes('tamilan') || s.includes('shakthi') || s.includes('vasantham');
}

// Parse in.m3u
const lines = inContent.split(/\r?\n/);
const existingTamil = [];
const existingOther = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('#EXTINF:')) {
    const info = lines[i];
    let url = '';
    let j = i + 1;
    while (j < lines.length && !lines[j].startsWith('#EXTINF:')) {
      if (lines[j].trim() && !lines[j].startsWith('#')) {
        url = lines[j].trim();
        break;
      }
      j++;
    }
    if (url) {
      if (isTamilChannel(info, url)) {
        // Tag with group-title="Tamil" if not present
        let updatedInfo = info;
        if (!updatedInfo.includes('group-title=')) {
          updatedInfo = updatedInfo.replace('#EXTINF:-1', '#EXTINF:-1 group-title="Tamil"');
        } else {
          updatedInfo = updatedInfo.replace(/group-title="[^"]*"/, 'group-title="Tamil"');
        }
        existingTamil.push({ info: updatedInfo, url });
      } else {
        existingOther.push({ info, url });
      }
    }
  }
}

// Combine: Priority Tamil -> Other Tamil -> Other Indian Channels
const combined = [];
const seenUrls = new Set();

for (const ch of priorityTamilChannels) {
  combined.push(ch);
  seenUrls.add(ch.url);
}

for (const ch of existingTamil) {
  if (!seenUrls.has(ch.url)) {
    combined.push(ch);
    seenUrls.add(ch.url);
  }
}

for (const ch of existingOther) {
  if (!seenUrls.has(ch.url)) {
    combined.push(ch);
    seenUrls.add(ch.url);
  }
}

console.log(`Organized ${combined.length} total channels!`);
console.log(`Tamil Channels at TOP: ${priorityTamilChannels.length + existingTamil.length}`);

// Write webos-app/data/in.m3u
let m3uOutput = '#EXTM3U\n';
for (const ch of combined) {
  m3uOutput += ch.info + '\n' + ch.url + '\n';
}
fs.writeFileSync(path.join(dataDir, 'in.m3u'), m3uOutput);
console.log('Saved to webos-app/data/in.m3u');
