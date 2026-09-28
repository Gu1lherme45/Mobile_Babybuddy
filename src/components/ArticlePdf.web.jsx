import { useMemo } from 'react'
import { pdfReaderHtml } from './pdfReaderHtml'

export default function ArticlePdf({ file }) {
  const html = useMemo(() => pdfReaderHtml(file.base64), [file])
  return <iframe title="Leitor do artigo em PDF" srcDoc={html} sandbox="allow-scripts"
    style={{ width: '100%', height: 580, border: 0, borderRadius: 16 }} />
}
