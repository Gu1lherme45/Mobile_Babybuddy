import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

export function pdfName(material) {
  return `${(material.title || 'artigo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || 'artigo'}.pdf`
}

export async function loadArticleFile(material) {
  const pdfUrl = requireHttpUrl(material?.pdfUrl)
  if (Platform.OS === 'web') {
    const response = await fetch(pdfUrl, { headers: material.downloadHeaders })
    if (!response.ok) throw new Error(await responseError(response, 'Não foi possível carregar o PDF.'))
    if (!response.headers.get('content-type')?.toLowerCase().includes('application/pdf')) {
      throw new Error('O servidor não retornou um PDF válido para este artigo.')
    }
    const blob = new Blob([await response.arrayBuffer()], { type: 'application/pdf' })
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    if (!base64.startsWith('JVBER')) throw new Error('O arquivo recebido não é um PDF válido.')
    return { base64, blob }
  }
  const cacheDirectory = FileSystem.cacheDirectory || FileSystem.documentDirectory
  if (!cacheDirectory) throw new Error('O armazenamento local não está disponível neste dispositivo.')
  const directory = `${cacheDirectory.replace(/\/$/, '')}/articles/`
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
  // Android's share dialog can close before the receiving app reads the attachment.
  // Retain shared cache files for 24h, then collect them on the next download.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const names = await FileSystem.readDirectoryAsync(directory).catch(() => [])
  await Promise.all(names.filter(name => /^\d+-/.test(name) && Number(name.split('-')[0]) < cutoff)
    .map(name => FileSystem.deleteAsync(directory + name, { idempotent: true }).catch(() => {})))
  const uri = `${directory}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${pdfName(material)}`
  try {
    const result = await FileSystem.downloadAsync(pdfUrl, uri, { headers: material.downloadHeaders })
    if (result.status !== 200) throw new Error(await responseErrorFromUri(result, uri, 'Não foi possível carregar o PDF.'))
    const responseType = result.headers?.['Content-Type'] || result.headers?.['content-type'] || ''
    if (!responseType.toLowerCase().includes('application/pdf')) {
      throw new Error('O servidor não retornou um PDF válido para este artigo.')
    }
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
    if (!base64.startsWith('JVBER')) throw new Error('O arquivo recebido não é um PDF válido.')
    return { uri, base64 }
  } catch (error) {
    await FileSystem.deleteAsync(uri, { idempotent: true })
    throw error
  }
}

function requireHttpUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) {
    throw new Error('O endereço do PDF deste artigo está ausente ou inválido. Atualize a lista e tente novamente.')
  }
  return value
}

async function responseError(response, fallback) {
  try {
    const data = await response.json()
    return data.message || data.error || fallback
  } catch (_) { return fallback }
}

async function responseErrorFromUri(response, uri, fallback) {
  const contentType = response.headers?.['Content-Type'] || response.headers?.['content-type'] || ''
  if (contentType.toLowerCase().includes('application/json')) {
    try {
      const body = await FileSystem.readAsStringAsync(uri)
      const data = JSON.parse(body)
      return data.message || data.error || fallback
    } catch (_) {}
  }
  return fallback
}

export async function releaseArticleFile(file) {
  if (file?.uri && !file.shared) await FileSystem.deleteAsync(file.uri, { idempotent: true }).catch(() => {})
}

export async function saveArticleFile(file, material) {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(file.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = pdfName(material)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    return true
  }
  if (Platform.OS === 'android') {
    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
    if (!permission.granted) return false
    if (!permission.directoryUri) throw new Error('A pasta selecionada não está disponível.')
    const destination = await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, pdfName(material), 'application/pdf')
    await FileSystem.writeAsStringAsync(destination, file.base64, { encoding: FileSystem.EncodingType.Base64 })
    return true
  }
  await shareArticleFile(file, material, 'Salvar PDF em Arquivos')
  return false
}

export async function shareArticleFile(file, material, dialogTitle = 'Selecione o WhatsApp para compartilhar o PDF') {
  if (Platform.OS === 'web') {
    const attachment = new File([file.blob], pdfName(material), { type: 'application/pdf' })
    if (!navigator.canShare?.({ files: [attachment] })) {
      throw new Error('Neste navegador, baixe o PDF e anexe o arquivo na conversa do WhatsApp.')
    }
    await navigator.share({ files: [attachment], title: material.title })
    return
  }
  if (!await Sharing.isAvailableAsync()) throw new Error('O compartilhamento não está disponível neste dispositivo.')
  file.shared = true
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle })
}
