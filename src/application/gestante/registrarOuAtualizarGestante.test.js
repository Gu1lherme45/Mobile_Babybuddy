import registrarOuAtualizarGestante from './registrarOuAtualizarGestante'
import GestanteRepository from '../../infrastructure/repositories/GestanteRepository'

jest.mock('../../infrastructure/repositories/GestanteRepository')

const FORM = { blood: 'O+', birthDate: '1998-01-10', doctor: '', hospital: '', weight: '', height: '', allergies: '' }

describe('registrarOuAtualizarGestante', () => {
  afterEach(() => jest.clearAllMocks())

  it('cria uma Gestante nova (vinculada ao usuário) quando ainda não existe id', async () => {
    GestanteRepository.criar.mockResolvedValue({ id: 5, usuario: { id: 3 }, dataNascimento: '1998-01-10', tipoSanguineo: 'O+', observacoes: 'Sem observações adicionais' })
    const gestante = await registrarOuAtualizarGestante(3, null, FORM)
    expect(GestanteRepository.criar).toHaveBeenCalledWith({
      dataNascimento: '1998-01-10', tipoSanguineo: 'O+', observacoes: 'Sem observações adicionais',
      usuario: { id: 3 },
    })
    expect(gestante.id).toBe(5)
  })

  it('atualiza a Gestante existente quando já há um id', async () => {
    GestanteRepository.atualizar.mockResolvedValue({ id: 5, dataNascimento: '1998-01-10', tipoSanguineo: 'O+', observacoes: 'Sem observações adicionais' })
    await registrarOuAtualizarGestante(3, 5, FORM)
    expect(GestanteRepository.atualizar).toHaveBeenCalledWith(5, {
      dataNascimento: '1998-01-10', tipoSanguineo: 'O+', observacoes: 'Sem observações adicionais',
    })
    expect(GestanteRepository.criar).not.toHaveBeenCalled()
  })
})
