import apiClient from '../http/apiClient'
import MaterialRepository from './MaterialRepository'
import { clearCredentials, setCredentials } from '../http/credentialsStore'
import { fetch as expoFetch } from 'expo/fetch'

jest.mock('../http/apiClient', () => ({ get: jest.fn(), post: jest.fn(), defaults: { baseURL: 'https://api.test' } }))
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: { uri: 'file:///cache' } } }))
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }))

describe('MaterialRepository', () => {
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => clearCredentials())

  it('lista somente pelo endpoint público', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] })
    await expect(MaterialRepository.listPublic()).resolves.toEqual([{ id: 1 }])
    expect(apiClient.get).toHaveBeenCalledWith('/api/materiais')
  })

  it('busca detalhe público pelo id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 3 } })
    await expect(MaterialRepository.findPublicById(3)).resolves.toEqual({ id: 3 })
    expect(apiClient.get).toHaveBeenCalledWith('/api/materiais/3')
  })

  it('envia multipart com metadados JSON e preserva o contrato da API', async () => {
    const { File } = require('expo-file-system')
    const { Platform } = require('react-native')
    const originalPlatform = Platform.OS
    const originalFormData = global.FormData
    const forms = []
    setCredentials('administrador@babybuddy.com.br', 'senha')
    Platform.OS = 'android'
    global.FormData = class MockFormData {
      constructor() { this.parts = []; forms.push(this) }
      append(name, value, filename) { this.parts.push([name, value, filename]) }
    }
    expoFetch.mockResolvedValue({ status: 201, text: async () => '{"id":7}' })
    File.mockImplementation((...parts) => {
      const uri = parts.map(part => typeof part === 'string' ? part : part.uri).join('/')
      const name = uri.split('/').pop()
      return { uri, name, type: 'application/pdf', size: 50, info: () => ({ exists: true, size: 50 }), create() {}, write() {} }
    })

    try {
      await expect(MaterialRepository.create({
        title: 'Guia', description: 'Resumo', category: 'Gestação', author: 'BabyBuddy',
        file: { uri: 'file:///cache/guia.pdf', name: 'guia.pdf', mimeType: 'application/pdf' },
      })).resolves.toEqual({ id: 7 })
      expect(File).toHaveBeenCalledWith('file:///cache/guia.pdf')
      expect(forms[0].parts[0][0]).toBe('dados')
      expect(forms[0].parts[0][1]).toEqual(expect.objectContaining({ type: 'application/json' }))
      expect(forms[0].parts[0][2]).toBe('dados.json')
      expect(forms[0].parts[1]).toEqual(['arquivo', expect.objectContaining({ uri: 'file:///cache/guia.pdf', name: 'guia.pdf' })])
      expect(expoFetch).toHaveBeenCalledWith('https://api.test/api/materiais', expect.objectContaining({
        method: 'POST', headers: { Authorization: expect.stringMatching(/^Basic /) }, body: forms[0],
      }))
      expect(expoFetch.mock.calls[0][1].headers['Content-Type']).toBeUndefined()
    } finally {
      Platform.OS = originalPlatform
      global.FormData = originalFormData
    }
  })
})
