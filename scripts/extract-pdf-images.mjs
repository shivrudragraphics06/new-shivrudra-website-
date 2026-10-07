import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const pdfPath = process.argv[2];
const outDir = process.argv[3];

if (!pdfPath || !outDir) {
  console.error("Usage: node scripts/extract-pdf-images.mjs <pdf> <out-dir>");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const data = fs.readFileSync(pdfPath);
const latin = data.toString("latin1");
const objectRegex = /(\d+)\s+(\d+)\s+obj\b/g;
const objects = [];
let match;

while ((match = objectRegex.exec(latin))) {
  const id = Number(match[1]);
  const start = match.index;
  const next = latin.indexOf("endobj", objectRegex.lastIndex);
  if (next === -1) continue;
  const end = next + "endobj".length;
  objects.push({ id, start, end, text: latin.slice(start, end) });
}

function parseDict(text) {
  const streamIndex = text.indexOf("stream");
  return streamIndex === -1 ? text : text.slice(0, streamIndex);
}

function getName(dict, key) {
  const re = new RegExp(`/${key}\\s*/([A-Za-z0-9_.-]+)`);
  return dict.match(re)?.[1];
}

function getNumber(dict, key) {
  const re = new RegExp(`/${key}\\s+(\\d+(?:\\.\\d+)?)`);
  const value = dict.match(re)?.[1];
  return value ? Number(value) : undefined;
}

function streamBytes(obj) {
  const streamToken = "stream";
  const streamIndex = obj.text.indexOf(streamToken);
  if (streamIndex === -1) return null;

  let streamStart = obj.start + streamIndex + streamToken.length;
  if (data[streamStart] === 0x0d && data[streamStart + 1] === 0x0a) streamStart += 2;
  else if (data[streamStart] === 0x0a || data[streamStart] === 0x0d) streamStart += 1;

  const endToken = "endstream";
  const endIndex = latin.indexOf(endToken, streamStart);
  if (endIndex === -1) return null;

  let streamEnd = endIndex;
  while (streamEnd > streamStart && (data[streamEnd - 1] === 0x0a || data[streamEnd - 1] === 0x0d)) {
    streamEnd -= 1;
  }
  return data.subarray(streamStart, streamEnd);
}

function toPng(width, height, bytes, colorType) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunks = [];

  function crc32(buf) {
    let crc = ~0;
    for (const byte of buf) {
      crc ^= byte;
      for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return ~crc >>> 0;
  }

  function chunk(type, payload) {
    const typeBuf = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(payload.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, payload])));
    chunks.push(Buffer.concat([len, typeBuf, payload, crc]));
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  chunk("IHDR", ihdr);

  const channels = colorType === 0 ? 1 : 3;
  const rows = [];
  const stride = width * channels;
  for (let y = 0; y < height; y += 1) {
    rows.push(Buffer.from([0]));
    rows.push(bytes.subarray(y * stride, y * stride + stride));
  }
  chunk("IDAT", zlib.deflateSync(Buffer.concat(rows)));
  chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([signature, ...chunks]);
}

const images = [];

for (const obj of objects) {
  const dict = parseDict(obj.text);
  if (!/\/Subtype\s*\/Image\b/.test(dict)) continue;

  const filter = getName(dict, "Filter");
  const width = getNumber(dict, "Width");
  const height = getNumber(dict, "Height");
  const bits = getNumber(dict, "BitsPerComponent");
  const colorSpace = getName(dict, "ColorSpace");
  const bytes = streamBytes(obj);
  if (!bytes || !width || !height) continue;

  let ext = "bin";
  let output = bytes;

  if (filter === "DCTDecode") ext = "jpg";
  else if (filter === "JPXDecode") ext = "jp2";
  else if (filter === "FlateDecode" && bits === 8) {
    const inflated = zlib.inflateSync(bytes);
    if (colorSpace === "DeviceRGB" && inflated.length >= width * height * 3) {
      output = toPng(width, height, inflated, 2);
      ext = "png";
    } else if (colorSpace === "DeviceGray" && inflated.length >= width * height) {
      output = toPng(width, height, inflated, 0);
      ext = "png";
    } else {
      output = inflated;
      ext = "raw";
    }
  }

  const filename = `pdf-image-${String(obj.id).padStart(4, "0")}-${width}x${height}.${ext}`;
  fs.writeFileSync(path.join(outDir, filename), output);
  images.push({ id: obj.id, width, height, bits, colorSpace, filter, filename, bytes: output.length });
}

console.table(images);
console.log(`Extracted ${images.length} image streams to ${outDir}`);
