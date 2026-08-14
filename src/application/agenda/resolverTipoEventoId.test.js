import resolverTipoEventoId from './resolverTipoEventoId'
import listarTiposEvento from './listarTiposEvento'

jest.mock('./listarTiposEvento')

describe('resolverTipoEventoId', () => {
  afterEach(() => jest.clearAllMocks())

  it('resolve o id do Evento a partir da categoria local', async () => {
    listarTiposEvento.mockResolvedValue([
      { id: 1, tipoEvento: 'consulta' },
      { id: 5, tipoEvento: 'outro' },
    ])
    expect(await resolverTipoEventoId('Consulta')).toBe(1)
    expect(await resolverTipoEventoId('Medicamento')).toBe(5)
  })

  it('retorna null quando o tipo não existe no backend', async () => {
    listarTiposEvento.mockResolvedValue([])
    expect(await resolverTipoEventoId('Consulta')).toBeNull()
  })
})
