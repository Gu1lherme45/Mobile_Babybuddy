import Agenda from './Agenda'

describe('Agenda.categoriaParaTipoEvento', () => {
  it.each([
    ['Consulta', 'consulta'],
    ['Exame', 'exame'],
    ['Medicamento', 'outro'],
    ['Outro', 'outro'],
    ['Categoria Desconhecida', 'outro'],
  ])('%s -> %s', (categoria, esperado) => {
    expect(Agenda.categoriaParaTipoEvento(categoria)).toBe(esperado)
  })
})

describe('Agenda.combinarDataHora', () => {
  it('combina data e hora em LocalDateTime ISO', () => {
    expect(Agenda.combinarDataHora('2026-06-15', '08:00')).toBe('2026-06-15T08:00:00')
  })

  it('usa 00:00 quando não há horário', () => {
    expect(Agenda.combinarDataHora('2026-06-15', '')).toBe('2026-06-15T00:00:00')
  })

  it('retorna null quando não há data (dataAgendada é obrigatória)', () => {
    expect(Agenda.combinarDataHora('', '08:00')).toBeNull()
  })
})

describe('Agenda.toPayload', () => {
  it('mapeia lembrete/evento local para o contrato de Agenda', () => {
    const payload = Agenda.toPayload(
      { title: 'Consulta pré-natal', date: '2026-09-10', time: '10:00', local: 'UBS Centro', notes: 'Levar exames' },
      3, 1
    )
    expect(payload).toEqual({
      usuario: { id: 3 },
      evento: { id: 1 },
      titulo: 'Consulta pré-natal',
      informacao: 'UBS Centro — Levar exames',
      dataAgendada: '2026-09-10T10:00:00',
    })
  })
})

describe('Agenda.fromDTO', () => {
  it('separa dataAgendada em date/time e mapeia o restante', () => {
    const compromisso = Agenda.fromDTO({
      id: 1, titulo: 'Consulta', informacao: 'x', dataAgendada: '2026-09-10T10:00:00',
      statusAgenda: 'AGENDADO', evento: { tipoEvento: 'consulta' }, usuario: { id: 3 },
    })
    expect(compromisso).toEqual({
      id: 1, title: 'Consulta', date: '2026-09-10', time: '10:00',
      informacao: 'x', tipoEvento: 'consulta', statusAgenda: 'AGENDADO', usuarioId: 3,
    })
  })
})
