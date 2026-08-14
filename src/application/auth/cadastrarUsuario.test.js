import cadastrarUsuario from './cadastrarUsuario'
import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'

jest.mock('../../infrastructure/repositories/UsuarioRepository')

describe('cadastrarUsuario', () => {
  afterEach(() => jest.clearAllMocks())

  it('cadastra sempre com nivelAcesso "Gestante"', async () => {
    UsuarioRepository.criar.mockResolvedValue({ id: 1 })
    await cadastrarUsuario('Lorena', 'lorena@a.com', '123')
    expect(UsuarioRepository.criar).toHaveBeenCalledWith({
      nome: 'Lorena', username: 'lorena@a.com', password: '123', nivelAcesso: 'Gestante',
    })
  })

  it('usa a mensagem de erro vinda do backend quando existir', async () => {
    UsuarioRepository.criar.mockRejectedValue({ response: { data: { error: 'Usuário já existe' } } })
    await expect(cadastrarUsuario('Lorena', 'lorena@a.com', '123')).rejects.toThrow('Usuário já existe')
  })

  it('cai para mensagem genérica quando o backend não manda detalhe', async () => {
    UsuarioRepository.criar.mockRejectedValue({ response: { data: {} } })
    await expect(cadastrarUsuario('Lorena', 'lorena@a.com', '123')).rejects.toThrow('Erro ao cadastrar')
  })
})
