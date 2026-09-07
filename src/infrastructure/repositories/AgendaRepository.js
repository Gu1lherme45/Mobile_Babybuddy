import apiClient from '../http/apiClient'

async function criar(agenda) {
  const response = await apiClient.post('/api/agendas', agenda)
  return response.data
}

async function listar() {
  const response = await apiClient.get('/api/agendas')
  return response.data
}

async function atualizar(id, agenda) {
  const response = await apiClient.put(`/api/agendas/${id}`, agenda)
  return response.data
}

async function cancelar(id) {
  await apiClient.patch(`/api/agendas/${id}/cancelar`)
}

async function remover(id) {
  await apiClient.delete(`/api/agendas/${id}`)
}

const AgendaRepository = {
  criar,
  listar,
  atualizar,
  cancelar,
  remover,
}

export default AgendaRepository
