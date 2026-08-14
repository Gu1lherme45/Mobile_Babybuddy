import GestanteRepository from '../../infrastructure/repositories/GestanteRepository'
import Gestante from '../../domain/gestante/Gestante'

// Não existe rota "GET /api/gestantes/por-usuario/{id}" — lista todas e filtra
// no cliente. Aceitável para o volume atual do projeto; se crescer, mover esse
// filtro para o backend.
export default async function obterGestanteDoUsuario(usuarioId) {
  const todas = await GestanteRepository.listar()
  const dto = todas.find(g => g.usuario?.id === usuarioId)
  return dto ? Gestante.fromDTO(dto) : null
}
