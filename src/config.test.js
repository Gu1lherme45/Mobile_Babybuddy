import { resolveApiUrl } from './config'

describe('resolveApiUrl', () => {
  it('usa localhost no Expo Web e no simulador iOS', () => {
    expect(resolveApiUrl('web')).toBe('http://localhost:8080')
    expect(resolveApiUrl('ios')).toBe('http://localhost:8080')
  })

  it('usa o alias do computador host no emulador Android', () => {
    expect(resolveApiUrl('android')).toBe('http://10.0.2.2:8080')
  })

  it('prioriza a URL configurada para celular fisico e remove barras finais', () => {
    expect(resolveApiUrl('android', '  http://192.168.0.25:8080///  '))
      .toBe('http://192.168.0.25:8080')
  })

  it('recusa URL sem protocolo HTTP', () => {
    expect(() => resolveApiUrl('android', '192.168.0.25:8080'))
      .toThrow('EXPO_PUBLIC_API_URL deve começar com http:// ou https://.')
  })
})
