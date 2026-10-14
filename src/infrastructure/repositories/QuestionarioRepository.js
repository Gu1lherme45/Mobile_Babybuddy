import apiClient from '../http/apiClient'

async function listarPorGestante(gestanteId) {
  const response = await apiClient.get(`/api/questionarios/gestante/${gestanteId}`)
  return response.data
}

const QuestionarioRepository = {
  listarPorGestante,
}

export default QuestionarioRepository
