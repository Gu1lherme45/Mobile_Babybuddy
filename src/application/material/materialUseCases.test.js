import MaterialRepository from '../../infrastructure/repositories/MaterialRepository'
import listarMateriais from './listarMateriais'
import obterMaterial from './obterMaterial'

jest.mock('../../config', () => ({ API_URL: 'http://api.test' }))
jest.mock('../../infrastructure/repositories/MaterialRepository', () => ({
  listPublic: jest.fn(),
  findPublicById: jest.fn(),
}))

describe('casos de uso de materiais', () => {
  beforeEach(() => jest.clearAllMocks())

  it('mapeia a lista pública para o domínio mobile', async () => {
    MaterialRepository.listPublic.mockResolvedValue([{ id: 1, titulo: 'Guia' }])
    await expect(listarMateriais()).resolves.toEqual([expect.objectContaining({ id: 1, title: 'Guia' })])
  })

  it('mapeia o detalhe público', async () => {
    MaterialRepository.findPublicById.mockResolvedValue({ id: 2, titulo: 'Sono' })
    await expect(obterMaterial(2)).resolves.toEqual(expect.objectContaining({ id: 2, title: 'Sono' }))
  })
})
