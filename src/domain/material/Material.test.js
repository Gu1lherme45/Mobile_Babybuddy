import { materialFromDTO } from './Material'

jest.mock('../../config', () => ({ API_URL: 'http://api.test' }))

describe('materialFromDTO', () => {
  it('mapeia o contrato público e transforma URLs relativas em absolutas', () => {
    expect(materialFromDTO({ id: 2, titulo: 'Guia', capa: '/api/materiais/2/capa', arquivo: '/api/materiais/2/conteudo' }))
      .toEqual(expect.objectContaining({
        id: 2,
        title: 'Guia',
        coverUrl: 'http://api.test/api/materiais/2/capa',
        pdfUrl: 'http://api.test/api/materiais/2/conteudo',
      }))
  })
})
