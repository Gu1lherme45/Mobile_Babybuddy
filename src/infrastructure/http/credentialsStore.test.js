import { setCredentials, getCredentials, clearCredentials } from './credentialsStore'

describe('credentialsStore', () => {
  afterEach(() => clearCredentials())

  it('retorna null quando não há sessão', () => {
    expect(getCredentials()).toBeNull()
  })

  it('guarda e limpa credenciais', () => {
    setCredentials('a@a.com', '123')
    expect(getCredentials()).toEqual({ username: 'a@a.com', password: '123' })
    clearCredentials()
    expect(getCredentials()).toBeNull()
  })
})
