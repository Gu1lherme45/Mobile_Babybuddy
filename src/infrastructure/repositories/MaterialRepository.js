import apiClient from '../http/apiClient'
import { API_URL } from '../../config'
import { File } from 'expo-file-system'
import { Platform } from 'react-native'
import { getCredentials } from '../http/credentialsStore'
import { assertValidFileUri, createArticleTextFile, createMetadataJsonFile } from '../material/articleUploadFile'

const MaterialRepository = {
  async listPublic() {
    const { data } = await apiClient.get('/api/materiais')
    return data
  },

  async findPublicById(id) {
    const { data } = await apiClient.get(`/api/materiais/${id}`)
    return data
  },

  async listCategories() {
    const { data } = await apiClient.get('/api/categorias-materiais')
    return data
  },

  async createCategory(name) {
    const { data } = await apiClient.post('/api/categorias-materiais', { nome: name })
    return data
  },

  async create({ title, description, category, author, content, file }) {
    const credentials = getCredentials()
    if (!credentials) throw new Error('Entre com a conta administradora para publicar um artigo.')

    const metadata = JSON.stringify({
      titulo: title.trim(),
      descricao: description.trim(),
      categoria: category.trim(),
      autor: author.trim(),
      link: '',
    })
    const endpoint = `${apiClient.defaults.baseURL || API_URL}/api/materiais`
    const auth = `Basic ${globalThis.btoa(`${credentials.username}:${credentials.password}`)}`

    let articlePart
    if (file) {
      const uri = assertValidFileUri(file.uri)
      const uploadFile = new File(uri)
      const fileInfo = uploadFile.info()
      if (!fileInfo.exists || !(fileInfo.size ?? uploadFile.size)) throw new Error('O arquivo selecionado não está acessível. Selecione-o novamente.')
      console.log('[UPLOAD] URI:', uri)
      if (!file.mimeType) throw new Error('O arquivo selecionado não informa um tipo MIME válido.')
      articlePart = { uri, name: file.name, type: file.mimeType }
    } else if (Platform.OS === 'web') {
      const articleName = `${title.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'artigo'}.md`
      articlePart = { blob: new Blob([content], { type: 'text/markdown' }), name: articleName, type: 'text/markdown' }
    } else {
      const prepared = createArticleTextFile(content, title)
      const uri = assertValidFileUri(prepared.uri)
      console.log('[UPLOAD] URI:', uri)
      console.log('[UPLOAD] MIME:', 'text/markdown')
      console.log('[UPLOAD] NAME:', prepared.name)
      articlePart = { uri, name: prepared.name, type: 'text/markdown' }
    }

    const form = new FormData()
    if (Platform.OS === 'web') {
      form.append('dados', new Blob([metadata], { type: 'application/json' }))
      if (articlePart.blob) {
        form.append('arquivo', articlePart.blob, articlePart.name)
      } else {
        const articleResponse = await fetch(articlePart.uri)
        if (!articleResponse.ok) throw new Error('O arquivo selecionado não pôde ser lido pelo navegador.')
        const articleBlob = new Blob([await articleResponse.blob()], { type: articlePart.type })
        form.append('arquivo', articleBlob, articlePart.name)
      }
    } else {
      // The endpoint binds `dados` as a JSON @RequestPart. Native FileSystemUploadTask
      // parameters cannot set a per-part MIME type, so FormData sends a typed JSON file part.
      const metadataFile = createMetadataJsonFile({
        titulo: title.trim(), descricao: description.trim(), categoria: category.trim(), autor: author.trim(), link: '',
      })
      form.append('dados', { uri: metadataFile.uri, name: metadataFile.name, type: metadataFile.mimeType })
      form.append('arquivo', articlePart)
    }
    console.log('[UPLOAD] MIME:', articlePart.type)
    console.log('[UPLOAD] NAME:', articlePart.name)
    console.log('[UPLOAD] uploadType:', 'MULTIPART')
    // Do not set Content-Type: fetch/FormData must generate the multipart boundary.
    const result = await fetch(endpoint, { method: 'POST', headers: { Authorization: auth }, body: form })
    const response = { status: result.status, body: await result.text() }

    if (response.status < 200 || response.status >= 300) {
      let message = 'Não foi possível publicar o artigo.'
      try { message = JSON.parse(response.body)?.message || JSON.parse(response.body)?.error || message } catch (_) {}
      throw new Error(message)
    }
    return JSON.parse(response.body)
  },
}

export default MaterialRepository
