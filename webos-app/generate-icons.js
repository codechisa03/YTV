const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, iconSize) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const r = width / 2 - 2;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter byte: none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark gradient background
      let red = Math.floor(10 + (x / width) * 20);
      let green = Math.floor(14 + (y / height) * 30);
      let blue = Math.floor(25 + ((x + y) / (width + height)) * 50);
      let alpha = 255;

      // Rounded square background
      const cornerR = width * 0.22;
      const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
      const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);

      if (cornerDist > cornerR) {
        alpha = 0; // Transparent outside rounded corner
      } else {
        // TV screen outline box in center
        const boxW = width * 0.55;
        const boxH = height * 0.40;
        const inBox = Math.abs(x - cx) <= boxW / 2 && Math.abs(y - (cy + height * 0.05)) <= boxH / 2;
        const onBorder = inBox && (
          Math.abs(Math.abs(x - cx) - boxW / 2) < width * 0.04 ||
          Math.abs(Math.abs(y - (cy + height * 0.05)) - boxH / 2) < height * 0.04
        );

        // TV Play triangle in center
        const triX = (x - cx) / (width * 0.15);
        const triY = (y - (cy + height * 0.05)) / (height * 0.15);
        const inPlay = triX >= -0.5 && triX <= 0.8 && Math.abs(triY) <= (0.8 - triX) * 0.7;

        // TV Antenna
        const antY = y - (cy - boxH / 2);
        const antX1 = (x - cx) + antY * 0.6;
        const antX2 = (x - cx) - antY * 0.6;
        const onAntenna = antY < 0 && antY > -height * 0.18 && (Math.abs(antX1) < 2 || Math.abs(antX2) < 2);

        if (inPlay) {
          // Vibrant cyan-white play symbol
          red = 255;
          green = 255;
          blue = 255;
        } else if (onBorder || onAntenna) {
          // Electric cyan TV frame
          red = 0;
          green = 229;
          blue = 255;
        } else if (inBox) {
          // Inner screen glow
          red = 15;
          green = 45;
          blue = 75;
        }
      }

      rawData[offset++] = red;
      rawData[offset++] = green;
      rawData[offset++] = blue;
      rawData[offset++] = alpha;
    }
  }

  const idatChunk = makeChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('f:/iptv-master/webos-app/icon.png', createPng(80, 80));
fs.writeFileSync('f:/iptv-master/webos-app/largeIcon.png', createPng(130, 130));
console.log('Generated icon.png (80x80) and largeIcon.png (130x130) successfully!');
