import { File, Paths } from 'expo-file-system'

const URI_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

export function assertValidFileUri(uri) {
  if (typeof uri !== 'string' || uri.trim().length === 0) {
    throw new Error('URI inválida: o seletor não retornou um endereço de arquivo.')
  }
  if (!URI_SCHEME.test(uri)) {
    throw new Error(`URI inválida: o endereço do arquivo não é absoluto (${uri}).`)
  }
  return uri
}

function safeFileName(name) {
  const leaf = String(name || 'artigo').split(/[\\/]/).pop()
  return leaf.replace(/[^a-zA-Z0-9._-]+/g, '-') || 'artigo'
}

export async function copyPickedArticleToCache(pickedFile) {
  if (!pickedFile || typeof pickedFile !== 'object') throw new Error('Nenhum arquivo foi selecionado.')
  const sourceUri = assertValidFileUri(pickedFile.uri)
  const source = pickedFile instanceof File ? pickedFile : new File(sourceUri)
  const sourceInfo = source.info()
  const sourceSize = sourceInfo.size ?? source.size
  if (!sourceInfo.exists || !sourceSize) throw new Error('O arquivo selecionado não existe ou está vazio.')

  const name = safeFileName(pickedFile.name || source.name)
  const destination = new File(Paths.cache, `article-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`)
  await source.copy(destination)
  const destinationUri = assertValidFileUri(destination.uri)
  const destinationInfo = destination.info()
  const destinationSize = destinationInfo.size ?? destination.size
  if (!destinationInfo.exists || !destinationSize) {
    throw new Error('Não foi possível preparar o arquivo selecionado para envio.')
  }
  return { uri: destinationUri, name, size: destinationSize }
}

export function createArticleTextFile(content, title) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('O conteúdo do artigo está vazio.')
  const name = `${safeFileName(title).replace(/\.[^.]+$/, '') || 'artigo'}.md`
  const file = new File(Paths.cache, `article-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`)
  file.create({ intermediates: true })
  file.write(content)
  const uri = assertValidFileUri(file.uri)
  const info = file.info()
  if (!info.exists || !file.size) throw new Error('Não foi possível preparar o texto do artigo para envio.')
  return { file, uri, name, size: file.size }
}
