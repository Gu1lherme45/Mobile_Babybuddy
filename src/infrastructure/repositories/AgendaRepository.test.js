import apiClient from '../http/apiClient'
import AgendaRepository from './AgendaRepository'

jest.mock('../http/apiClient')

describe('AgendaRepository', () => {
  afterEach(() => jest.clearAllMocks())

  it('criar chama POST /api/agendas e retorna o corpo', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 1 } })
    const result = await AgendaRepository.criar({ titulo: 'Consulta' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/agendas', { titulo: 'Consulta' })
    expect(result).toEqual({ id: 1 })
  })

  it('listar chama GET /api/agendas', async () => {
    apiClient.get.mockResolvedValue({ data: [] })
    const result = await AgendaRepository.listar()
    expect(apiClient.get).toHaveBeenCalledWith('/api/agendas')
    expect(result).toEqual([])
  })

  it('atualizar chama PUT e retorna o corpo', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 1 } })
    const result = await AgendaRepository.atualizar(1, { titulo: 'Nova' })
    expect(apiClient.put).toHaveBeenCalledWith('/api/agendas/1', { titulo: 'Nova' })
    expect(result).toEqual({ id: 1 })
  })

  it('cancelar chama PATCH .../cancelar sem corpo', async () => {
    apiClient.patch.mockResolvedValue({})
    await AgendaRepository.cancelar(1)
    expect(apiClient.patch).toHaveBeenCalledWith('/api/agendas/1/cancelar')
  })

  it('remover chama DELETE', async () => {
    apiClient.delete.mockResolvedValue({})
    await AgendaRepository.remover(1)
    expect(apiClient.delete).toHaveBeenCalledWith('/api/agendas/1')
  })
})
