import Gestante from './Gestante'

describe('Gestante.toPayload', () => {
  it('mapeia blood/birthDate para tipoSanguineo/dataNascimento e sintetiza observacoes', () => {
    const payload = Gestante.toPayload({
      blood: 'O+', birthDate: '1998-01-10',
      doctor: 'Dra. Ana', hospital: 'Materno Infantil', weight: '65', height: '165', allergies: 'Dipirona',
    })
    expect(payload.tipoSanguineo).toBe('O+')
    expect(payload.dataNascimento).toBe('1998-01-10')
    expect(payload.observacoes).toBe(
      'Médico/a: Dra. Ana · Hospital/Maternidade: Materno Infantil · Peso: 65kg · Altura: 165cm · Alergias: Dipirona'
    )
  })

  it('usa texto padrão quando nenhum campo complementar foi preenchido', () => {
    const payload = Gestante.toPayload({ blood: 'A+', birthDate: '2000-05-05' })
    expect(payload.observacoes).toBe('Sem observações adicionais')
  })

  it('trunca observacoes em 200 caracteres (limite do backend)', () => {
    const payload = Gestante.toPayload({
      blood: 'A+', birthDate: '2000-05-05', doctor: 'D'.repeat(250),
    })
    expect(payload.observacoes.length).toBe(200)
  })
})

describe('Gestante.fromDTO', () => {
  it('mapeia o DTO do backend para o shape do formulário', () => {
    const gestante = Gestante.fromDTO({
      id: 1, dataNascimento: '1998-01-10', tipoSanguineo: 'O+',
      observacoes: 'x', usuario: { id: 3 },
    })
    expect(gestante).toEqual({ id: 1, birthDate: '1998-01-10', blood: 'O+', observacoes: 'x', usuarioId: 3 })
  })
})
