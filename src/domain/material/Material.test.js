import { materialFromDTO } from './Material'

jest.mock('../../config', () => ({ API_URL: 'http://api.test' }))

describe('materialFromDTO', () => {
  it('separa HTML de leitura do PDF e prioriza a imagem do artigo', () => {
    expect(materialFromDTO({ id: 2, arquivo: '/conteudo', mimeType: 'text/html', pdfUrl: '/pdf', imagem: '/imagem' }))
      .toEqual(expect.objectContaining({ contentUrl: 'http://api.test/conteudo', contentType: 'text/html', pdfUrl: 'http://api.test/pdf', coverUrl: 'http://api.test/imagem' }))
  })
  it('não trata HTML de uma API antiga como PDF', () => {
    expect(materialFromDTO({ id: 2, arquivo: '/conteudo', mimeType: 'text/html' }).pdfUrl)
      .toBe('http://api.test/api/materiais/2/pdf')
    expect(materialFromDTO({ arquivo: '/conteudo', pdfUrl: null }).pdfUrl).toBe('')
  })
  it('mapeia o contrato público e transforma URLs relativas em absolutas', () => {
    expect(materialFromDTO({ id: 2, titulo: 'Guia', capa: '/api/materiais/2/capa', arquivo: '/api/materiais/2/conteudo' }))
      .toEqual(expect.objectContaining({
        id: 2,
        title: 'Guia',
        coverUrl: 'http://api.test/api/materiais/2/capa',
        pdfUrl: 'http://api.test/api/materiais/2/conteudo',
      }))
  })
  it('falls back to the generated PDF endpoint when content exists', () => {
    expect(materialFromDTO({ id: 7, conteudoUrl: '/api/materiais/7/conteudo', pdfUrl: null }))
      .toEqual(expect.objectContaining({
        contentUrl: 'http://api.test/api/materiais/7/conteudo',
        pdfUrl: 'http://api.test/api/materiais/7/pdf',
      }))
  })
})
