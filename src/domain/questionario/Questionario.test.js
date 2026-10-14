import Questionario from './Questionario'

describe('Questionario.fromDTO', () => {
  it('devolve os acentos que o banco remove das respostas', () => {
    const questionario = Questionario.fromDTO({
      id: 7,
      semanaGestacional: 24,
      dataPrevistaParto: '2027-02-03',
      primeiraGestacao: 'sim',
      tipoSanguineo: 'O+',
      condicaoSaude: 'Hipertensao',
      condicaoSaudeOutra: null,
      prenatalRegular: 'Ainda nao iniciei',
      possuiAlergia: 'nao',
      alergiaEspecificacao: null,
      dataPreenchimento: '2026-10-14T09:30:00',
      gestante: { id: 2 },
    })
    expect(questionario).toEqual({
      id: 7,
      semanaGestacional: 24,
      dataPrevistaParto: '2027-02-03',
      primeiraGestacao: 'Sim',
      tipoSanguineo: 'O+',
      condicaoSaude: 'Hipertensão',
      condicaoSaudeOutra: '',
      prenatalRegular: 'Ainda não iniciei',
      possuiAlergia: 'Não',
      alergiaEspecificacao: '',
      dataPreenchimento: '2026-10-14T09:30:00',
    })
  })

  it('mantém valores que não precisam de ajuste', () => {
    expect(Questionario.rotulo('Diabetes gestacional')).toBe('Diabetes gestacional')
    expect(Questionario.rotulo('Valor novo')).toBe('Valor novo')
    expect(Questionario.rotulo(null)).toBe('')
  })
})

describe('Questionario.maisRecente', () => {
  it('escolhe o preenchimento mais recente', () => {
    const recente = Questionario.maisRecente([
      { id: 1, dataPreenchimento: '2026-08-01T10:00:00' },
      { id: 2, dataPreenchimento: '2026-10-14T10:00:00' },
      { id: 3, dataPreenchimento: '2026-09-01T10:00:00' },
    ])
    expect(recente.id).toBe(2)
  })

  it('desempata pelo maior id', () => {
    const recente = Questionario.maisRecente([
      { id: 4, dataPreenchimento: '2026-10-14T10:00:00' },
      { id: 9, dataPreenchimento: '2026-10-14T10:00:00' },
    ])
    expect(recente.id).toBe(9)
  })

  it('retorna null quando não há questionários', () => {
    expect(Questionario.maisRecente([])).toBeNull()
    expect(Questionario.maisRecente(undefined)).toBeNull()
  })
})

describe('Questionario.semanaAtual', () => {
  const hoje = new Date(2026, 9, 14)

  it('calcula a semana de hoje a partir da data prevista do parto', () => {
    expect(Questionario.semanaAtual('2027-02-03', hoje)).toBe(24)
  })

  it('está na 40ª semana no dia previsto do parto', () => {
    expect(Questionario.semanaAtual('2026-10-14', hoje)).toBe(40)
  })

  it('fica entre a 1ª e a 42ª semana', () => {
    expect(Questionario.semanaAtual('2026-09-14', hoje)).toBe(42)
    expect(Questionario.semanaAtual('2027-08-10', hoje)).toBe(1)
  })

  it('retorna null sem data válida', () => {
    expect(Questionario.semanaAtual('', hoje)).toBeNull()
    expect(Questionario.semanaAtual('03/02/2027', hoje)).toBeNull()
  })
})
