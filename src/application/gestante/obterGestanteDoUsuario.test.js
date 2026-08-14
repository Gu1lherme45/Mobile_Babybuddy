import obterGestanteDoUsuario from './obterGestanteDoUsuario'
import GestanteRepository from '../../infrastructure/repositories/GestanteRepository'

jest.mock('../../infrastructure/repositories/GestanteRepository')

describe('obterGestanteDoUsuario', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna a gestante do usuário quando existe na lista', async () => {
    GestanteRepository.listar.mockResolvedValue([
      { id: 1, usuario: { id: 9 }, dataNascimento: '1990-01-01', tipoSanguineo: 'A+', observacoes: 'x' },
      { id: 2, usuario: { id: 3 }, dataNascimento: '1998-01-10', tipoSanguineo: 'O+', observacoes: 'y' },
    ])
    const gestante = await obterGestanteDoUsuario(3)
    expect(gestante).toEqual({ id: 2, birthDate: '1998-01-10', blood: 'O+', observacoes: 'y', usuarioId: 3 })
  })

  it('retorna null quando o usuário ainda não tem gestante cadastrada', async () => {
    GestanteRepository.listar.mockResolvedValue([{ id: 1, usuario: { id: 9 } }])
    const gestante = await obterGestanteDoUsuario(3)
    expect(gestante).toBeNull()
  })
})
