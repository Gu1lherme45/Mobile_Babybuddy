import apiClient from '../http/apiClient'
import QuestionarioRepository from './QuestionarioRepository'

jest.mock('../http/apiClient')

describe('QuestionarioRepository', () => {
  afterEach(() => jest.clearAllMocks())

  it('listarPorGestante chama GET /api/questionarios/gestante/{id}', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 5 }] })
    const result = await QuestionarioRepository.listarPorGestante(2)
    expect(apiClient.get).toHaveBeenCalledWith('/api/questionarios/gestante/2', undefined)
    expect(result).toEqual([{ id: 5 }])
  })

  it('repassa o cancelamento da sessão e o timeout ao consultar as respostas', async () => {
    const options = { signal: new AbortController().signal, timeout: 15000 }
    apiClient.get.mockResolvedValue({ data: [] })
    await QuestionarioRepository.listarPorGestante(2, options)
    expect(apiClient.get).toHaveBeenCalledWith('/api/questionarios/gestante/2', options)
  })
})
