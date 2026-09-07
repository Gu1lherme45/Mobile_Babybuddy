import AgendaRepository from '../../infrastructure/repositories/AgendaRepository'

export default async function removerCompromisso(id) {
  if (!id) return
  await AgendaRepository.remover(id).catch(() => {})
}
