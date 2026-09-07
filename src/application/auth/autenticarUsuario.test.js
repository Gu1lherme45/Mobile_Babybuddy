import autenticarUsuario from './autenticarUsuario'
import verificarCredenciais from './verificarCredenciais'

jest.mock('./verificarCredenciais')

describe('autenticarUsuario', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna o usuário quando as credenciais são válidas', async () => {
    verificarCredenciais.mockResolvedValue({ id: 1, nome: 'Lorena', email: 'lorena@a.com' })
    const usuario = await autenticarUsuario('lorena@a.com', '123')
    expect(usuario).toEqual({ id: 1, nome: 'Lorena', email: 'lorena@a.com' })
  })

  it('traduz qualquer erro para "Usuário ou senha inválidos"', async () => {
    verificarCredenciais.mockRejectedValue(new Error('Network Error'))
    await expect(autenticarUsuario('x@a.com', 'errada')).rejects.toThrow('Usuário ou senha inválidos')
  })
})
