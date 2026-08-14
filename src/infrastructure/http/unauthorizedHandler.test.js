import { setUnauthorizedHandler, notifyUnauthorized } from './unauthorizedHandler'

describe('unauthorizedHandler', () => {
  afterEach(() => setUnauthorizedHandler(null))

  it('chama o handler registrado', () => {
    const handler = jest.fn()
    setUnauthorizedHandler(handler)
    notifyUnauthorized()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('não quebra quando não há handler registrado', () => {
    expect(() => notifyUnauthorized()).not.toThrow()
  })
})
