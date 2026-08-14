import listarTiposEvento, { _resetCacheParaTestes } from './listarTiposEvento'
import EventoRepository from '../../infrastructure/repositories/EventoRepository'

jest.mock('../../infrastructure/repositories/EventoRepository')

describe('listarTiposEvento', () => {
  beforeEach(() => {
    _resetCacheParaTestes()
    jest.clearAllMocks()
  })

  it('busca do backend na primeira chamada', async () => {
    EventoRepository.listar.mockResolvedValue([{ id: 1, tipoEvento: 'consulta' }])
    const tipos = await listarTiposEvento()
    expect(tipos).toEqual([{ id: 1, tipoEvento: 'consulta' }])
    expect(EventoRepository.listar).toHaveBeenCalledTimes(1)
  })

  it('usa cache em memória nas chamadas seguintes (não bate no backend de novo)', async () => {
    EventoRepository.listar.mockResolvedValue([{ id: 1, tipoEvento: 'consulta' }])
    await listarTiposEvento()
    await listarTiposEvento()
    expect(EventoRepository.listar).toHaveBeenCalledTimes(1)
  })
})
