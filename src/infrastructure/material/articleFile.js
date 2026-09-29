import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

export function pdfName(material) {
  return `${(material.title || 'artigo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || 'artigo'}.pdf`
}

export async function loadArticleFile(material) {
  if (Platform.OS === 'web') {
    const response = await fetch(material.pdfUrl)
    if (!response.ok) throw new Error('Não foi possível carregar o PDF.')
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
  const directory = `${FileSystem.cacheDirectory}articles/`
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
  // Android's share dialog can close before the receiving app reads the attachment.
  // Retain shared cache files for 24h, then collect them on the next download.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const names = await FileSystem.readDirectoryAsync(directory).catch(() => [])
  await Promise.all(names.filter(name => /^\d+-/.test(name) && Number(name.split('-')[0]) < cutoff)
    .map(name => FileSystem.deleteAsync(directory + name, { idempotent: true }).catch(() => {})))
  const uri = `${directory}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${pdfName(material)}`
  try {
    const result = await FileSystem.downloadAsync(material.pdfUrl, uri)
    if (result.status !== 200) throw new Error('Não foi possível carregar o PDF.')
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
    if (!base64.startsWith('JVBER')) throw new Error('O arquivo recebido não é um PDF válido.')
    return { uri, base64 }
  } catch (error) {
    await FileSystem.deleteAsync(uri, { idempotent: true })
    throw error
  }
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
