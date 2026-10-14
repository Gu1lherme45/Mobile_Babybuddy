import obterQuestionarioDoUsuario from './obterQuestionarioDoUsuario'
import GestanteRepository from '../../infrastructure/repositories/GestanteRepository'
import QuestionarioRepository from '../../infrastructure/repositories/QuestionarioRepository'

jest.mock('../../infrastructure/repositories/GestanteRepository')
jest.mock('../../infrastructure/repositories/QuestionarioRepository')

describe('obterQuestionarioDoUsuario', () => {
  afterEach(() => jest.clearAllMocks())

  it('busca os questionários da gestante do usuário e retorna o mais recente', async () => {
    GestanteRepository.listar.mockResolvedValue([
      { id: 1, usuario: { id: 9 } },
      { id: 2, usuario: { id: 3 } },
    ])
    QuestionarioRepository.listarPorGestante.mockResolvedValue([
      { id: 10, possuiAlergia: 'sim', dataPreenchimento: '2026-08-01T10:00:00' },
      { id: 11, possuiAlergia: 'nao', dataPreenchimento: '2026-10-01T10:00:00' },
    ])

    const questionario = await obterQuestionarioDoUsuario(3)

    expect(QuestionarioRepository.listarPorGestante).toHaveBeenCalledWith(2)
    expect(questionario.id).toBe(11)
    expect(questionario.possuiAlergia).toBe('Não')
  })

  it('retorna null sem consultar questionários quando o usuário não tem gestante', async () => {
    GestanteRepository.listar.mockResolvedValue([{ id: 1, usuario: { id: 9 } }])

    const questionario = await obterQuestionarioDoUsuario(3)

    expect(questionario).toBeNull()
    expect(QuestionarioRepository.listarPorGestante).not.toHaveBeenCalled()
  })

  it('retorna null quando a gestante ainda não respondeu o questionário', async () => {
    GestanteRepository.listar.mockResolvedValue([{ id: 2, usuario: { id: 3 } }])
    QuestionarioRepository.listarPorGestante.mockResolvedValue([])

    expect(await obterQuestionarioDoUsuario(3)).toBeNull()
  })
})
