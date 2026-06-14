/**
 * 使用 esbuild 构建 Electron 主进程 & 预加载脚本
 */
import * as esbuild from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const isWatch = process.argv.includes('--watch')

const buildOptions = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['electron', 'lowdb', 'lowdb/node'],
  logLevel: 'info',
}

// ---------- 主进程 ----------
const mainCtx = await esbuild.context({
  ...buildOptions,
  entryPoints: [path.join(root, 'electron/main.ts')],
  outfile: path.join(root, 'dist-electron/main.cjs'),
})

// ---------- 预加载脚本 ----------
const preloadCtx = await esbuild.context({
  ...buildOptions,
  entryPoints: [path.join(root, 'electron/preload.ts')],
  outfile: path.join(root, 'dist-electron/preload.cjs'),
})

if (isWatch) {
  console.log('[electron] Watching for changes...')
  await Promise.all([mainCtx.watch(), preloadCtx.watch()])
  console.log('[electron] Build complete. Watching for changes...')
} else {
  await Promise.all([mainCtx.rebuild(), preloadCtx.rebuild()])
  await mainCtx.dispose()
  await preloadCtx.dispose()
  console.log('[electron] Build complete.')
}
