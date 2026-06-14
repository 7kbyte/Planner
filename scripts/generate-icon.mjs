/**
 * 程序化生成应用图标 PNG
 * 使用 pngjs 纯 JS 编码器，无需任何原生依赖
 */
import { PNG } from 'pngjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'public', 'icon.png')

// ==================== 图标参数 ====================

const SIZE = 512
const RADIUS = 88 // 圆角半径
const CALENDAR_TOP = 160
const CALENDAR_LEFT = 128
const CALENDAR_W = 256
const CALENDAR_H = 224
const CALENDAR_RADIUS = 24
const HEADER_H = 56
const CHECK_Y = 310
const CHECK_R = 52

// ==================== 颜色 ====================

const BG_COLOR = { r: 0x63, g: 0x66, b: 0xf1 } // indigo-500
const BG_COLOR2 = { r: 0x4f, g: 0x46, b: 0xe5 } // indigo-600
const WHITE = { r: 0xff, g: 0xff, b: 0xff }
const HEADER_BG = { r: 0xe0, g: 0xe7, b: 0xff }
const CHECK_GREEN = { r: 0x22, g: 0xc5, b: 0x5e }
const LINE_GRAY = { r: 0xc7, g: 0xd2, b: 0xfe }

// ==================== 绘图工具 ====================

function setPixel(data, x, y, c, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  data[i] = c.r
  data[i + 1] = c.g
  data[i + 2] = c.b
  data[i + 3] = a
}

function isInRoundedRect(px, py, rx, ry, rw, rh, rr) {
  if (px < rx || px >= rx + rw || py < ry || py >= ry + rh) return false
  // 四角
  if (px < rx + rr && py < ry + rr) return Math.hypot(px - (rx + rr), py - (ry + rr)) <= rr
  if (px >= rx + rw - rr && py < ry + rr) return Math.hypot(px - (rx + rw - rr - 1), py - (ry + rr)) <= rr
  if (px < rx + rr && py >= ry + rh - rr) return Math.hypot(px - (rx + rr), py - (ry + rh - rr - 1)) <= rr
  if (px >= rx + rw - rr && py >= ry + rh - rr) return Math.hypot(px - (rx + rw - rr - 1), py - (ry + rh - rr - 1)) <= rr
  return true
}

function blend(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  }
}

// ==================== 绘制图标 ====================

const png = new PNG({ width: SIZE, height: SIZE })
const { data } = png

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    // 背景渐变
    const t = y / SIZE
    const bg = blend(BG_COLOR, BG_COLOR2, t)

    if (isInRoundedRect(x, y, 0, 0, SIZE, SIZE, RADIUS)) {
      // 日历白色区域
      if (
        x >= CALENDAR_LEFT && x < CALENDAR_LEFT + CALENDAR_W &&
        y >= CALENDAR_TOP && y < CALENDAR_TOP + CALENDAR_H &&
        isInRoundedRect(x, y, CALENDAR_LEFT, CALENDAR_TOP, CALENDAR_W, CALENDAR_H, CALENDAR_RADIUS)
      ) {
        // 日历头部
        if (y < CALENDAR_TOP + HEADER_H) {
          setPixel(data, x, y, HEADER_BG)
        }
        // 绿色对勾
        else if (Math.hypot(x - SIZE / 2, y - CHECK_Y) <= CHECK_R) {
          // 对勾圆
          setPixel(data, x, y, CHECK_GREEN)
        } else if (
          // 对勾线条（简化：区域内着色）
          y >= CHECK_Y - 20 && y <= CHECK_Y + 20 &&
          x >= SIZE / 2 - CHECK_R + 8 && x <= SIZE / 2 + CHECK_R - 8
        ) {
          // 白色对勾 (简化用圆替代)
        }
        // 日历文字行
        else if (y >= CALENDAR_TOP + HEADER_H + 40 && y < CALENDAR_TOP + HEADER_H + 52) {
          if (x >= CALENDAR_LEFT + 40 && x < CALENDAR_LEFT + CALENDAR_W - 40) {
            setPixel(data, x, y, LINE_GRAY)
          }
        } else if (y >= CALENDAR_TOP + HEADER_H + 64 && y < CALENDAR_TOP + HEADER_H + 76) {
          if (x >= CALENDAR_LEFT + 40 && x < CALENDAR_LEFT + 160) {
            setPixel(data, x, y, HEADER_BG)
          }
        }
        // 其余日历白色
        else {
          setPixel(data, x, y, WHITE, 242)
        }
      } else {
        // 背景渐变
        setPixel(data, x, y, bg)
      }
    }
  }
}

// 画对勾（白色描边）
function drawCheckLine(x1, y1, x2, y2, width) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const cx = Math.round(x1 + (x2 - x1) * t)
    const cy = Math.round(y1 + (y2 - y1) * t)
    for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
      for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        if (Math.hypot(dx, dy) <= width / 2 && Math.hypot(cx + dx - SIZE / 2, cy + dy - CHECK_Y) <= CHECK_R - 2) {
          setPixel(data, cx + dx, cy + dy, WHITE)
        }
      }
    }
  }
}

// 对勾路径
drawCheckLine(SIZE / 2 - 16, CHECK_Y, SIZE / 2 - 2, CHECK_Y + 14, 10)
drawCheckLine(SIZE / 2 - 2, CHECK_Y + 14, SIZE / 2 + 16, CHECK_Y - 6, 10)

fs.writeFileSync(outPath, PNG.sync.write(png))
console.log(`[icon] 已生成 ${outPath} (${SIZE}×${SIZE})`)
