import apiClient from '../http/apiClient'

async function criar(gestante) {
  const response = await apiClient.post('/api/gestantes', gestante)
  return response.data
}

async function listar() {
  const response = await apiClient.get('/api/gestantes')
  return response.data
}

async function buscarPorId(id) {
  const response = await apiClient.get(`/api/gestantes/${id}`)
  return response.data
}

async function atualizar(id, gestante) {
  const response = await apiClient.put(`/api/gestantes/${id}`, gestante)
  return response.data
}

const GestanteRepository = {
  criar,
  listar,
  buscarPorId,
  atualizar,
}

export default GestanteRepository
