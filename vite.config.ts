import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const uni = (uniPlugin as unknown as { default?: typeof uniPlugin }).default || uniPlugin

const noJekyllPlugin = () => ({
  name: 'h5-nojekyll',
  apply: 'build' as const,
  writeBundle(outputOptions: { dir?: string }) {
    if (process.env.UNI_PLATFORM !== 'h5' || !outputOptions.dir) return

    const outputPath = resolve(outputOptions.dir, '.nojekyll')
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, '')
  }
})

export default defineConfig({
  base: process.env.UNI_PLATFORM === 'h5' ? './' : '/',
  server: { host: '0.0.0.0' },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin']
      }
    }
  },
  build: {
    target: 'es2018',
    rolldownOptions: {
      checks: {
        pluginTimings: false
      }
    }
  },
  plugins: [uni(), noJekyllPlugin()]
})
