import AgendaRepository from '../../infrastructure/repositories/AgendaRepository'
import Agenda from '../../domain/agenda/Agenda'

// GET /api/agendas lista todas — filtra no cliente pelo usuário logado
// (não existe rota "por usuário").
export default async function listarCompromissos(usuarioId) {
  const todas = await AgendaRepository.listar()
  return todas.filter(a => a.usuario?.id === usuarioId).map(Agenda.fromDTO)
}
