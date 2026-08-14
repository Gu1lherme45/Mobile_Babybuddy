import AgendaRepository from '../../infrastructure/repositories/AgendaRepository'
import Agenda from '../../domain/agenda/Agenda'
import resolverTipoEventoId from './resolverTipoEventoId'

// dataAgendada é NOT NULL no backend; sem data, o compromisso fica só local
// (mesma lógica de "não força dado que o usuário não preencheu" da Sprint 2).
export default async function registrarCompromisso(usuarioId, dadosLocal, categoria) {
  if (!dadosLocal.date) return null
  const eventoId = await resolverTipoEventoId(categoria)
  const payload = Agenda.toPayload(dadosLocal, usuarioId, eventoId)
  const dto = await AgendaRepository.criar(payload)
  return Agenda.fromDTO(dto)
}
