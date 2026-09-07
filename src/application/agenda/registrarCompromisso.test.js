import registrarCompromisso from './registrarCompromisso'
import AgendaRepository from '../../infrastructure/repositories/AgendaRepository'
import resolverTipoEventoId from './resolverTipoEventoId'

jest.mock('../../infrastructure/repositories/AgendaRepository')
jest.mock('./resolverTipoEventoId')

describe('registrarCompromisso', () => {
  afterEach(() => jest.clearAllMocks())

  it('resolve o tipo de evento e cria a Agenda no backend', async () => {
    resolverTipoEventoId.mockResolvedValue(1)
    AgendaRepository.criar.mockResolvedValue({
      id: 9, titulo: 'Consulta', dataAgendada: '2026-09-10T10:00:00', statusAgenda: 'AGENDADO',
      evento: { tipoEvento: 'consulta' }, usuario: { id: 3 },
    })
    const compromisso = await registrarCompromisso(3, { title: 'Consulta', date: '2026-09-10', time: '10:00' }, 'Consulta')
    expect(resolverTipoEventoId).toHaveBeenCalledWith('Consulta')
    expect(AgendaRepository.criar).toHaveBeenCalledWith({
      usuario: { id: 3 }, evento: { id: 1 }, titulo: 'Consulta', informacao: null, dataAgendada: '2026-09-10T10:00:00',
    })
    expect(compromisso.id).toBe(9)
  })

  it('não chama o backend quando não há data (dataAgendada é obrigatória)', async () => {
    const result = await registrarCompromisso(3, { title: 'Sem data' }, 'Outro')
    expect(result).toBeNull()
    expect(AgendaRepository.criar).not.toHaveBeenCalled()
  })
})
