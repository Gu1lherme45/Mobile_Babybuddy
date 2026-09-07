import verificarCredenciais from './verificarCredenciais'
import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'
import { getCredentials, clearCredentials } from '../../infrastructure/http/credentialsStore'

jest.mock('../../infrastructure/repositories/UsuarioRepository')

describe('verificarCredenciais', () => {
  afterEach(() => {
    jest.clearAllMocks()
    clearCredentials()
  })

  it('valida contra o backend, guarda a sessão e retorna o usuário mapeado', async () => {
    UsuarioRepository.buscarMe.mockResolvedValue({ id: 1, nome: 'Lorena', username: 'lorena@a.com' })
    const usuario = await verificarCredenciais('lorena@a.com', '123')
    expect(UsuarioRepository.buscarMe).toHaveBeenCalledWith({ username: 'lorena@a.com', password: '123' })
    expect(usuario).toEqual({ id: 1, nome: 'Lorena', email: 'lorena@a.com' })
    expect(getCredentials()).toEqual({ username: 'lorena@a.com', password: '123' })
  })

  it('propaga o erro e não guarda sessão quando as credenciais são inválidas', async () => {
    UsuarioRepository.buscarMe.mockRejectedValue(new Error('401'))
    await expect(verificarCredenciais('x@a.com', 'errada')).rejects.toThrow()
    expect(getCredentials()).toBeNull()
  })
})
