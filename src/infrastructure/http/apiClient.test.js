import apiClient from './apiClient'
import { API_URL } from '../../config'

describe('apiClient', () => {
  it('usa API_URL como baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe(API_URL)
  })

  it('tem exatamente um interceptor de request (o de auth)', () => {
    expect(apiClient.interceptors.request.handlers.filter(Boolean)).toHaveLength(1)
  })
})
