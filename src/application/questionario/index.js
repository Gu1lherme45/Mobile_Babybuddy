import GestanteRepository from '../../infrastructure/repositories/GestanteRepository'
import QuestionarioRepository from '../../infrastructure/repositories/QuestionarioRepository'
import { questionarioMaisRecente, toPayload, validarQuestionario } from '../../domain/questionario/Questionario'

export async function obterAnamnese(usuarioId, { signal } = {}) {
  if (!usuarioId) throw new Error('Entre na sua conta para acessar o questionário.')
  const options = { timeout: 15000, signal }
  const gestantes = await GestanteRepository.listar(options)
  const gestante = gestantes.find(item => String(item.usuario?.id) === String(usuarioId)) || null
  const questionarios = gestante ? await QuestionarioRepository.listarPorGestante(gestante.id, options) : []
  return { gestante, questionario: questionarioMaisRecente(questionarios) }
}

export async function salvarAnamnese(usuarioId, dados, { signal } = {}) {
  const erro = validarQuestionario(dados)
  if (erro) throw new Error(erro.mensagem)
  // Reconsulta antes de gravar: evita duplicar após erro de rede ou preenchimento no Web.
  const options = { timeout: 15000, signal }
  const existente = await obterAnamnese(usuarioId, options)
  const payloadGestante = {
    usuario: { id: usuarioId }, dataNascimento: dados.dataNascimento,
    tipoSanguineo: dados.tipoSanguineo, observacoes: existente.gestante?.observacoes || '',
  }
  const gestante = existente.gestante
    ? await GestanteRepository.atualizar(existente.gestante.id, payloadGestante, options)
    : await GestanteRepository.criar(payloadGestante, options)
  if (!gestante?.id) throw new Error('Não foi possível confirmar o cadastro da gestante. Tente novamente.')
  const payload = toPayload(dados, gestante.id)
  const questionario = existente.questionario
    ? await QuestionarioRepository.atualizar(existente.questionario.id, payload, options)
    : await QuestionarioRepository.criar(payload, options)
  if (!questionario?.id || questionario.aceiteTermos !== true) throw new Error('Não foi possível confirmar o envio do questionário. Tente novamente.')
  return { gestante, questionario }
}
