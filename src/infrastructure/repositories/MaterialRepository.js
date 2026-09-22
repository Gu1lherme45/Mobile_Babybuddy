import apiClient from '../http/apiClient'

const MaterialRepository = {
  async listPublic() {
    const { data } = await apiClient.get('/api/materiais')
    return data
  },

  async findPublicById(id) {
    const { data } = await apiClient.get(`/api/materiais/${id}`)
    return data
  },
}

export default MaterialRepository
