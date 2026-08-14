import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'
import Usuario from '../../domain/usuario/Usuario'
import { setCredentials } from '../../infrastructure/http/credentialsStore'

// Confirma um par email/senha contra o backend e, se válido, torna-o a
// sessão corrente (usada tanto no login quanto na restauração de sessão no boot).
export default async function verificarCredenciais(email, password) {
  const dto = await UsuarioRepository.buscarMe({ username: email, password })
  setCredentials(email, password)
  return Usuario.fromDTO(dto)
}
