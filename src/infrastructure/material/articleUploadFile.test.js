import { assertValidFileUri, copyPickedArticleToCache, createArticleTextFile } from './articleUploadFile'

jest.mock('expo-file-system', () => {
  class MockFile {
    constructor(...parts) {
      this.uri = parts.map(part => typeof part === 'string' ? part : part.uri).join('/')
      this.name = this.uri.split('/').pop()
      this.contents = ''
      this.size = 10
      this._exists = true
    }
    info() { return { exists: this._exists } }
    async copy(destination) { destination.contents = this.contents || 'binary'; destination._exists = true }
    create() { this.contents = ''; this._exists = true }
    write(value) { this.contents = value; this.size = value.length }
  }
  return { File: MockFile, Paths: { cache: { uri: 'file:///cache' } } }
})

it('recusa URI vazia, não textual ou relativa', () => {
  expect(() => assertValidFileUri(undefined)).toThrow('não retornou')
  expect(() => assertValidFileUri('guia.pdf')).toThrow('não é absoluto')
})

it('copia URI de provedor do Android para um arquivo absoluto no cache', async () => {
  const source = { uri: 'content://provider/document/12', name: 'guia.pdf', size: 123, info: () => ({ exists: true }), contents: 'pdf' }
  const cached = await copyPickedArticleToCache(source)
  expect(cached.uri).toMatch(/^file:\/\/\/cache\/article-upload-/)
  expect(cached.name).toBe('guia.pdf')
})

it('cria texto escrito como arquivo Markdown real no cache', () => {
  const prepared = createArticleTextFile('# Guia', 'Guia da gestação')
  expect(prepared.uri).toMatch(/^file:\/\/\/cache\/article-upload-/)
  expect(prepared.name).toBe('Guia-da-gesta-o.md')
  expect(prepared.file.contents).toBe('# Guia')
})
