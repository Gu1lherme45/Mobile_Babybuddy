import removerCompromisso from './removerCompromisso'
import AgendaRepository from '../../infrastructure/repositories/AgendaRepository'

jest.mock('../../infrastructure/repositories/AgendaRepository')

describe('removerCompromisso', () => {
  afterEach(() => jest.clearAllMocks())

  it('remove no backend quando há id remoto', async () => {
    AgendaRepository.remover.mockResolvedValue()
    await removerCompromisso(9)
    expect(AgendaRepository.remover).toHaveBeenCalledWith(9)
  })

  it('não chama o backend quando o compromisso ainda é só local (sem id remoto)', async () => {
    await removerCompromisso(null)
    expect(AgendaRepository.remover).not.toHaveBeenCalled()
  })

  it('é best-effort: engole erro de rede sem propagar', async () => {
    AgendaRepository.remover.mockRejectedValue(new Error('offline'))
    await expect(removerCompromisso(9)).resolves.toBeUndefined()
  })
})
