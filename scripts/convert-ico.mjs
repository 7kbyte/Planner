/**
 * 将已生成的 icon.png 转换为 icon.ico（Windows 图标格式）
 */
import { PNG } from 'pngjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pngPath = path.join(root, 'public', 'icon.png')
const icoPath = path.join(root, 'public', 'icon.ico')

const pngData = fs.readFileSync(pngPath)
const png = PNG.sync.read(pngData)

// ICO 格式：将 RGBA 数据转为 BMP 并包装为 ICO
const width = png.width
const height = png.height
const pixels = png.data

// 创建 AND mask (1 bit per pixel, rounded up to 4 bytes per row)
const maskRowSize = Math.ceil(width / 8)
const maskSize = maskRowSize * height
const mask = Buffer.alloc(maskSize, 0)

// BMP 数据（BGRA，倒序行）
const bmpRowSize = width * 4
const bmpDataSize = bmpRowSize * height
const bmpData = Buffer.alloc(bmpDataSize)

for (let y = 0; y < height; y++) {
  const srcY = height - 1 - y // BMP is bottom-up
  for (let x = 0; x < width; x++) {
    const srcIdx = (srcY * width + x) * 4
    const dstIdx = (y * width + x) * 4
    // RGB → BGR (Windows BMP format)
    bmpData[dstIdx] = pixels[srcIdx + 2]     // B
    bmpData[dstIdx + 1] = pixels[srcIdx + 1] // G
    bmpData[dstIdx + 2] = pixels[srcIdx]     // R
    bmpData[dstIdx + 3] = 0                  // Reserved
  }
}

// BMP header (40 bytes for BITMAPINFOHEADER) + pixel data
const bmpHeaderSize = 40
const bmpTotalSize = bmpHeaderSize + bmpDataSize

// ICO file header (6 bytes)
const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)    // Reserved
icoHeader.writeUInt16LE(1, 2)    // ICO type
icoHeader.writeUInt16LE(1, 4)    // Image count

// ICO directory entry (16 bytes)
const entry = Buffer.alloc(16)
entry.writeUInt8(width >= 256 ? 0 : width, 0)
entry.writeUInt8(height >= 256 ? 0 : height, 1)
entry.writeUInt8(0, 2)           // Color palette
entry.writeUInt8(0, 3)           // Reserved
entry.writeUInt16LE(0, 4)        // Color planes (for ICO: 0)
entry.writeUInt16LE(32, 6)       // Bits per pixel
entry.writeUInt32LE(bmpTotalSize, 8)  // BMP size
entry.writeUInt32LE(22, 12)      // Offset to BMP data (6 header + 16 entry)

// Build complete ICO
const ico = Buffer.concat([icoHeader, entry, bmpData])

fs.writeFileSync(icoPath, ico)
console.log(`[icon] 已生成 ${icoPath} (${width}×${height})`)
