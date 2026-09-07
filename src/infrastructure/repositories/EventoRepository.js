import apiClient from '../http/apiClient'

async function listar() {
  const response = await apiClient.get('/api/eventos')
  return response.data
}

const EventoRepository = { listar }

export default EventoRepository
