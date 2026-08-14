import listarTiposEvento from './listarTiposEvento'
import Agenda from '../../domain/agenda/Agenda'

export default async function resolverTipoEventoId(categoria) {
  const tipo = Agenda.categoriaParaTipoEvento(categoria)
  const tipos = await listarTiposEvento()
  const encontrado = tipos.find(t => t.tipoEvento === tipo)
  return encontrado ? encontrado.id : null
}
