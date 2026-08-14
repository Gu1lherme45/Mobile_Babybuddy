import { attachAuthInterceptor } from './authInterceptor'
import { setCredentials, clearCredentials } from './credentialsStore'

function createFakeClient() {
  let handler
  return {
    interceptors: { request: { use: (fn) => { handler = fn } } },
    run: (config) => handler(config),
  }
}

describe('authInterceptor', () => {
  afterEach(() => clearCredentials())

  it('injeta auth quando há sessão salva', () => {
    setCredentials('a@a.com', '123')
    const client = attachAuthInterceptor(createFakeClient())
    expect(client.run({}).auth).toEqual({ username: 'a@a.com', password: '123' })
  })

  it('não injeta auth quando não há sessão (rotas públicas)', () => {
    const client = attachAuthInterceptor(createFakeClient())
    expect(client.run({}).auth).toBeUndefined()
  })

  it('não sobrescreve auth explícito (ex.: verificação de login antes de existir sessão)', () => {
    setCredentials('sessao@a.com', 'senha-sessao')
    const client = attachAuthInterceptor(createFakeClient())
    const explicitAuth = { username: 'login@a.com', password: 'x' }
    expect(client.run({ auth: explicitAuth }).auth).toBe(explicitAuth)
  })
})
