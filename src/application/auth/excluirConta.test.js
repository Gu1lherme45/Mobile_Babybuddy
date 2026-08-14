import excluirConta from './excluirConta'
import UsuarioRepository from '../../infrastructure/repositories/UsuarioRepository'

jest.mock('../../infrastructure/repositories/UsuarioRepository')

describe('excluirConta', () => {
  afterEach(() => jest.clearAllMocks())

  it('remove o usuário quando há sessão', async () => {
    UsuarioRepository.remover.mockResolvedValue()
    await excluirConta(3)
    expect(UsuarioRepository.remover).toHaveBeenCalledWith(3)
  })

  it('não chama o backend quando não há usuário logado', async () => {
    await excluirConta(null)
    expect(UsuarioRepository.remover).not.toHaveBeenCalled()
  })

  it('é best-effort: engole erro de rede sem propagar', async () => {
    UsuarioRepository.remover.mockRejectedValue(new Error('offline'))
    await expect(excluirConta(3)).resolves.toBeUndefined()
  })
})
