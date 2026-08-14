import apiClient from '../http/apiClient'
import GestanteRepository from './GestanteRepository'

jest.mock('../http/apiClient')

describe('GestanteRepository', () => {
  afterEach(() => jest.clearAllMocks())

  it('criar chama POST /api/gestantes e retorna o corpo', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 1 } })
    const result = await GestanteRepository.criar({ tipoSanguineo: 'O+' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/gestantes', { tipoSanguineo: 'O+' })
    expect(result).toEqual({ id: 1 })
  })

  it('listar chama GET /api/gestantes', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] })
    const result = await GestanteRepository.listar()
    expect(apiClient.get).toHaveBeenCalledWith('/api/gestantes')
    expect(result).toEqual([{ id: 1 }])
  })

  it('buscarPorId chama GET /api/gestantes/{id}', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1 } })
    const result = await GestanteRepository.buscarPorId(1)
    expect(apiClient.get).toHaveBeenCalledWith('/api/gestantes/1')
    expect(result).toEqual({ id: 1 })
  })

  it('atualizar chama PUT /api/gestantes/{id}', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 1 } })
    const result = await GestanteRepository.atualizar(1, { tipoSanguineo: 'A+' })
    expect(apiClient.put).toHaveBeenCalledWith('/api/gestantes/1', { tipoSanguineo: 'A+' })
    expect(result).toEqual({ id: 1 })
  })
})
