import trocarSenha from './trocarSenha'
import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'
import { getCredentials, clearCredentials } from '../../infrastructure/http/credentialsStore'

jest.mock('../../infrastructure/repositories/UsuarioRepository')

describe('trocarSenha', () => {
  afterEach(() => {
    jest.clearAllMocks()
    clearCredentials()
  })

  it('troca a senha no backend e atualiza a sessão local com a nova senha', async () => {
    UsuarioRepository.trocarSenha.mockResolvedValue()
    await trocarSenha(3, 'lorena@a.com', 'NovaSenha@123')
    expect(UsuarioRepository.trocarSenha).toHaveBeenCalledWith(3, 'NovaSenha@123')
    expect(getCredentials()).toEqual({ username: 'lorena@a.com', password: 'NovaSenha@123' })
  })
})
