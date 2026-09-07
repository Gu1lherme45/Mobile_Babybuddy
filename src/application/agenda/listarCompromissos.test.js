import listarCompromissos from './listarCompromissos'
import AgendaRepository from '../../infrastructure/repositories/AgendaRepository'

jest.mock('../../infrastructure/repositories/AgendaRepository')

describe('listarCompromissos', () => {
  afterEach(() => jest.clearAllMocks())

  it('filtra só os compromissos do usuário logado e mapeia para o domínio', async () => {
    AgendaRepository.listar.mockResolvedValue([
      { id: 1, titulo: 'A', dataAgendada: '2026-09-10T10:00:00', usuario: { id: 3 } },
      { id: 2, titulo: 'B', dataAgendada: '2026-09-11T10:00:00', usuario: { id: 9 } },
    ])
    const compromissos = await listarCompromissos(3)
    expect(compromissos).toHaveLength(1)
    expect(compromissos[0].id).toBe(1)
  })
})
