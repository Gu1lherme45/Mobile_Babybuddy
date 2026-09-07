import apiClient from '../http/apiClient'

async function criar(usuario) {
  const response = await apiClient.post('/api/usuarios', usuario)
  return response.data
}

async function buscarMe(credenciais = null) {
  const config = credenciais ? { auth: credenciais } : {}
  const response = await apiClient.get('/api/usuarios/me', config)
  return response.data
}

async function buscarPorId(id) {
  const response = await apiClient.get(`/api/usuarios/${id}`)
  return response.data
}

async function atualizar(id, usuario) {
  const response = await apiClient.put(`/api/usuarios/${id}`, usuario)
  return response.data
}

async function trocarSenha(id, senha) {
  await apiClient.patch(`/api/usuarios/${id}/senha`, { senha })
}

async function remover(id) {
  await apiClient.delete(`/api/usuarios/${id}`)
}

const UsuarioRepository = {
  criar,
  buscarMe,
  buscarPorId,
  atualizar,
  trocarSenha,
  remover,
}

export default UsuarioRepository
