import apiClient from '../http/apiClient'
import EventoRepository from './EventoRepository'

jest.mock('../http/apiClient')

describe('EventoRepository', () => {
  afterEach(() => jest.clearAllMocks())

  it('listar chama GET /api/eventos e retorna o corpo', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, tipoEvento: 'consulta' }] })
    const result = await EventoRepository.listar()
    expect(apiClient.get).toHaveBeenCalledWith('/api/eventos')
    expect(result).toEqual([{ id: 1, tipoEvento: 'consulta' }])
  })
})
