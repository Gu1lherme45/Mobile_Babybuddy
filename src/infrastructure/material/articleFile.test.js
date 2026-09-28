import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { loadArticleFile, pdfName, saveArticleFile, shareArticleFile } from './articleFile'

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/', EncodingType: { Base64: 'base64' },
  makeDirectoryAsync: jest.fn(), downloadAsync: jest.fn(), readAsStringAsync: jest.fn(),
  deleteAsync: jest.fn().mockResolvedValue(), writeAsStringAsync: jest.fn(),
  StorageAccessFramework: { requestDirectoryPermissionsAsync: jest.fn(), createFileAsync: jest.fn() },
}))
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }))

const material = { title: 'Gestação / saudável', pdfUrl: 'https://api.test/artigo' }
beforeEach(() => { jest.clearAllMocks(); Platform.OS = 'android' })

it('produz um nome de arquivo sem separadores de caminho', () => {
  expect(pdfName(material)).toBe('Gestacao-saudavel.pdf')
})
it('rejeita respostas HTTP de erro e remove o arquivo temporário', async () => {
  FileSystem.downloadAsync.mockResolvedValue({ status: 404 })
  await expect(loadArticleFile(material)).rejects.toThrow()
  expect(FileSystem.deleteAsync).toHaveBeenCalled()
})
it('rejeita HTML retornado como se fosse PDF', async () => {
  FileSystem.downloadAsync.mockResolvedValue({ status: 200 })
  FileSystem.readAsStringAsync.mockResolvedValue('PGh0bWw+')
  await expect(loadArticleFile(material)).rejects.toThrow('PDF válido')
})
it('respeita o cancelamento da escolha da pasta', async () => {
  FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync.mockResolvedValue({ granted: false })
  await expect(saveArticleFile({ base64: 'JVBERi0=' }, material)).resolves.toBe(false)
  expect(FileSystem.StorageAccessFramework.createFileAsync).not.toHaveBeenCalled()
})
it('salva o PDF na pasta selecionada no Android', async () => {
  FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync.mockResolvedValue({ granted: true, directoryUri: 'content://downloads' })
  FileSystem.StorageAccessFramework.createFileAsync.mockResolvedValue('content://downloads/artigo.pdf')
  await expect(saveArticleFile({ base64: 'JVBERi0=' }, material)).resolves.toBe(true)
  expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith('content://downloads/artigo.pdf', 'JVBERi0=', { encoding: 'base64' })
})
it('compartilha o arquivo local como PDF, sem enviar o link da API', async () => {
  Sharing.isAvailableAsync.mockResolvedValue(true)
  await shareArticleFile({ uri: 'file:///artigo.pdf' }, material)
  expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///artigo.pdf', expect.objectContaining({ mimeType: 'application/pdf' }))
})
