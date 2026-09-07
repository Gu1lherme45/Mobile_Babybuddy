import apiClient from '../http/apiClient'
import UsuarioRepository from './UsuarioRepository'

jest.mock('../http/apiClient')

describe('UsuarioRepository', () => {
  afterEach(() => jest.clearAllMocks())

  it('criar chama POST /api/usuarios e retorna o corpo', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 1 } })
    const result = await UsuarioRepository.criar({ nome: 'A' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/usuarios', { nome: 'A' })
    expect(result).toEqual({ id: 1 })
  })

  it('buscarMe sem override deixa o interceptor resolver a sessão', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1 } })
    await UsuarioRepository.buscarMe()
    expect(apiClient.get).toHaveBeenCalledWith('/api/usuarios/me', {})
  })

  it('buscarMe com override passa auth explícito (fluxo de login)', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 1 } })
    const creds = { username: 'a@a.com', password: '123' }
    await UsuarioRepository.buscarMe(creds)
    expect(apiClient.get).toHaveBeenCalledWith('/api/usuarios/me', { auth: creds })
  })

  it('buscarPorId chama GET /api/usuarios/{id}', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 5 } })
    const result = await UsuarioRepository.buscarPorId(5)
    expect(apiClient.get).toHaveBeenCalledWith('/api/usuarios/5')
    expect(result).toEqual({ id: 5 })
  })

  it('atualizar chama PUT e retorna o corpo', async () => {
    apiClient.put.mockResolvedValue({ data: { id: 3 } })
    const result = await UsuarioRepository.atualizar(3, { nome: 'B' })
    expect(apiClient.put).toHaveBeenCalledWith('/api/usuarios/3', { nome: 'B' })
    expect(result).toEqual({ id: 3 })
  })

  it('trocarSenha chama PATCH .../senha', async () => {
    apiClient.patch.mockResolvedValue({})
    await UsuarioRepository.trocarSenha(3, 'nova')
    expect(apiClient.patch).toHaveBeenCalledWith('/api/usuarios/3/senha', { senha: 'nova' })
  })

  it('remover chama DELETE', async () => {
    apiClient.delete.mockResolvedValue({})
    await UsuarioRepository.remover(3)
    expect(apiClient.delete).toHaveBeenCalledWith('/api/usuarios/3')
  })
})
