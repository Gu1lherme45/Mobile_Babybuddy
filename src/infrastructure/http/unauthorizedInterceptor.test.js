import { attachUnauthorizedInterceptor } from './unauthorizedInterceptor'
import { setUnauthorizedHandler } from './unauthorizedHandler'

function createFakeClient() {
  let errorHandler
  return {
    interceptors: { response: { use: (_onSuccess, onError) => { errorHandler = onError } } },
    reject: (error) => errorHandler(error),
  }
}

describe('unauthorizedInterceptor', () => {
  afterEach(() => setUnauthorizedHandler(null))

  it('dispara o handler em 401 de chamada com sessão implícita (sem auth explícito)', async () => {
    const handler = jest.fn()
    setUnauthorizedHandler(handler)
    const client = attachUnauthorizedInterceptor(createFakeClient())

    await expect(client.reject({ response: { status: 401 }, config: {} })).rejects.toBeDefined()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('NÃO dispara em 401 de chamada com auth explícito (verificação de login/restauração)', async () => {
    const handler = jest.fn()
    setUnauthorizedHandler(handler)
    const client = attachUnauthorizedInterceptor(createFakeClient())

    await expect(
      client.reject({ response: { status: 401 }, config: { auth: { username: 'x', password: 'y' } } })
    ).rejects.toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('não dispara em erros que não são 401', async () => {
    const handler = jest.fn()
    setUnauthorizedHandler(handler)
    const client = attachUnauthorizedInterceptor(createFakeClient())

    await expect(client.reject({ response: { status: 500 }, config: {} })).rejects.toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('sempre rejeita a promise (não engole o erro)', async () => {
    const client = attachUnauthorizedInterceptor(createFakeClient())
    const error = { response: { status: 401 }, config: {} }
    await expect(client.reject(error)).rejects.toBe(error)
  })
})
