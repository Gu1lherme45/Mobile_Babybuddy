import apiClient from '../http/apiClient'

async function criar(gestante, ...requestOptions) {
  const response = await apiClient.post('/api/gestantes', gestante, ...requestOptions)
  return response.data
}

async function listar(...requestOptions) {
  const response = await apiClient.get('/api/gestantes', ...requestOptions)
  return response.data
}

async function buscarPorId(id) {
  const response = await apiClient.get(`/api/gestantes/${id}`)
  return response.data
}

async function atualizar(id, gestante, ...requestOptions) {
  const response = await apiClient.put(`/api/gestantes/${id}`, gestante, ...requestOptions)
  return response.data
}

const GestanteRepository = {
  criar,
  listar,
  buscarPorId,
  atualizar,
}

export default GestanteRepository
