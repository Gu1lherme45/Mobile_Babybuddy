import Usuario from './Usuario'

describe('Usuario.fromDTO', () => {
  it('mapeia o DTO do backend (username) para o shape do app (email)', () => {
    const usuario = Usuario.fromDTO({ id: 3, nome: 'Lorena', username: 'lorena@a.com', nivelAcesso: 'Gestante' })
    expect(usuario).toEqual({ id: 3, nome: 'Lorena', email: 'lorena@a.com' })
  })
})
