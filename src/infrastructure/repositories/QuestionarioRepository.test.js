import apiClient from '../http/apiClient'
import QuestionarioRepository from './QuestionarioRepository'

jest.mock('../http/apiClient')

describe('QuestionarioRepository', () => {
  afterEach(() => jest.clearAllMocks())

  it('listarPorGestante chama GET /api/questionarios/gestante/{id}', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 5 }] })
    const result = await QuestionarioRepository.listarPorGestante(2)
    expect(apiClient.get).toHaveBeenCalledWith('/api/questionarios/gestante/2')
    expect(result).toEqual([{ id: 5 }])
  })
})
