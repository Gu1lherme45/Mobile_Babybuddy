import apiClient from '../http/apiClient'

const QuestionarioRepository = {
  async listarPorGestante(gestanteId, options) {
    const response = await apiClient.get(`/api/questionarios/gestante/${gestanteId}`, options)
    return response.data
  },
  async criar(payload, options) {
    const response = await apiClient.post('/api/questionarios', payload, options)
    return response.data
  },
  async atualizar(id, payload, options) {
    const response = await apiClient.put(`/api/questionarios/${id}`, payload, options)
    return response.data
  },
}

export default QuestionarioRepository
