import { pdfReaderHtml } from './pdfReaderHtml'

jest.mock('./pdfEngine.json', () => ({ engine: '</script><script>unsafe</script>', worker: 'worker code' }))

it('não permite injetar HTML pelo conteúdo do documento', () => {
  expect(() => pdfReaderHtml('</script>')).toThrow('PDF inválido')
})
it('protege os scripts incorporados e inclui controles de leitura', () => {
  const html = pdfReaderHtml('JVBERi0=')
  expect(html).not.toContain('</script><script>unsafe')
  expect(html).toContain('Página anterior')
  expect(html).toContain('Próxima página')
  expect(html).toContain('isEvalSupported:false')
})
