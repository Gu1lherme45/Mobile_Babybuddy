import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'

export default async function excluirConta(usuarioId) {
  if (!usuarioId) return
  await UsuarioRepository.remover(usuarioId).catch(() => {})
}
