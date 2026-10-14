import QuestionarioRepository from '../../infrastructure/repositories/QuestionarioRepository'
import Questionario from '../../domain/questionario/Questionario'
import obterGestanteDoUsuario from '../gestante/obterGestanteDoUsuario'

// O questionário é respondido no site e fica ligado à Gestante, não ao Usuario.
// Não existe rota "questionário do usuário logado": o caminho é usuário → gestante
// → GET /api/questionarios/gestante/{id} (o mesmo que o site faz para revisar).
export default async function obterQuestionarioDoUsuario(usuarioId) {
  const gestante = await obterGestanteDoUsuario(usuarioId)
  if (!gestante) return null
  const questionarios = await QuestionarioRepository.listarPorGestante(gestante.id)
  const recente = Questionario.maisRecente(questionarios)
  return recente ? Questionario.fromDTO(recente) : null
}
