import EventoRepository from '../../infrastructure/repositories/EventoRepository'

// Os tipos de Evento são praticamente estáticos (seed do DataInitializer) — cacheia
// em memória por sessão do app para não bater em GET /api/eventos a cada compromisso.
let cache = null

export default async function listarTiposEvento() {
  if (!cache) cache = await EventoRepository.listar()
  return cache
}

export function _resetCacheParaTestes() {
  cache = null
}
