import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'
import { setCredentials } from '../../infrastructure/http/credentialsStore'

export default async function trocarSenha(usuarioId, email, novaSenha) {
  await UsuarioRepository.trocarSenha(usuarioId, novaSenha)
  setCredentials(email, novaSenha)
}
