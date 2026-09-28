// Bundle PDF.js as text for the isolated WebView, without a remote viewer/CDN.
const fs = require('node:fs')
const path = require('node:path')
const root = path.dirname(require.resolve('pdfjs-dist/package.json'))
fs.writeFileSync(path.join(__dirname, '../src/components/pdfEngine.json'), JSON.stringify({
  engine: fs.readFileSync(path.join(root, 'legacy/build/pdf.mjs'), 'utf8'),
  worker: fs.readFileSync(path.join(root, 'legacy/build/pdf.worker.mjs'), 'utf8'),
}))
