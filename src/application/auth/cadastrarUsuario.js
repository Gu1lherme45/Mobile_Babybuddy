import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'

function extrairMensagemErro(err) {
  const data = err.response?.data
  if (typeof data === 'string' && data) return data
  if (data?.error) return data.error
  if (data?.message) return data.message
  return 'Erro ao cadastrar'
}

export default async function cadastrarUsuario(nome, email, password) {
  try {
    await UsuarioRepository.criar({ nome, username: email, password, nivelAcesso: 'Gestante' })
  } catch (err) {
    throw new Error(extrairMensagemErro(err))
  }
}
