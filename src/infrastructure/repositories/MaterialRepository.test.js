import apiClient from '../http/apiClient'
import MaterialRepository from './MaterialRepository'

jest.mock('../http/apiClient', () => ({ get: jest.fn() }))

describe('MaterialRepository', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lista somente pelo endpoint público', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] })
    await expect(MaterialRepository.listPublic()).resolves.toEqual([{ id: 1 }])
    expect(apiClient.get).toHaveBeenCalledWith('/api/materiais')
  })

  it('busca detalhe público pelo id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 3 } })
    await expect(MaterialRepository.findPublicById(3)).resolves.toEqual({ id: 3 })
    expect(apiClient.get).toHaveBeenCalledWith('/api/materiais/3')
  })
})
