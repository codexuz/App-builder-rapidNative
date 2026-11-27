import fs from 'node:fs';

export interface ImageDimensions {
  format: 'png' | 'jpg' | 'webp' | 'unknown';
  width: number;
  height: number;
  bytes: number;
}

/**
 * Zero-dependency image header parser supporting PNG, JPEG, and WebP
 * so Kie.ai generated assets can be validated without native binary dependencies.
 */
export function inspectImageFile(filePath: string): ImageDimensions {
  const buf = fs.readFileSync(filePath);
  const bytes = buf.length;

  // PNG: 89 50 4E 47 0D 0A 1A 0A, IHDR width/height at bytes 16..24
  if (bytes >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return {
      format: 'png',
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      bytes,
    };
  }

  // WebP: RIFF....WEBP
  if (
    bytes >= 30 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X' && bytes >= 30) {
      const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { format: 'webp', width, height, bytes };
    }
    if (chunk === 'VP8 ' && bytes >= 30) {
      const width = buf.readUInt16LE(26) & 0x3fff;
      const height = buf.readUInt16LE(28) & 0x3fff;
      return { format: 'webp', width, height, bytes };
    }
    if (chunk === 'VP8L' && bytes >= 25) {
      const bits = buf.readUInt32LE(21);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { format: 'webp', width, height, bytes };
    }
  }

  // JPEG: FF D8 ... scan SOF0..SOF3 markers
  if (bytes >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
        offset += 2;
        continue;
      }
      const segmentLen = buf.readUInt16BE(offset + 2);
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { format: 'jpg', width, height, bytes };
      }
      if (segmentLen < 2) break;
      offset += 2 + segmentLen;
    }
    return { format: 'jpg', width: 0, height: 0, bytes };
  }

  return { format: 'unknown', width: 0, height: 0, bytes };
}
