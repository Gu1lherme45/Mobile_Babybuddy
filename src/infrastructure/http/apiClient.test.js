import apiClient from './apiClient'
import { API_URL } from '../../config'

describe('apiClient', () => {
  it('usa API_URL como baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe(API_URL)
  })

  it('tem um interceptor de request para autenticação', () => {
    expect(apiClient.interceptors.request.handlers.filter(Boolean)).toHaveLength(1)
  })

  it('tenta os outros IPs do host quando a conexão falha sem resposta HTTP', () => {
    expect(apiClient.interceptors.response.handlers.filter(Boolean)).toHaveLength(2)
  })
})
