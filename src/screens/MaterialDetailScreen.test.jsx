import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react-native'
import { Alert, Platform } from 'react-native'
import MaterialDetailScreen from './MaterialDetailScreen'
import { obterMaterial } from '../application/material'
import { loadArticleHtml } from '../components/articleDocument'
import { loadArticleFile, saveArticleFile, shareArticleFile } from '../infrastructure/material/articleFile'

jest.mock('../application/material', () => ({ obterMaterial: jest.fn() }))
jest.mock('../components/articleDocument', () => ({ loadArticleHtml: jest.fn() }))
jest.mock('../components/Icon', () => ({ Icon: () => null }))
jest.mock('../components/ArticlePdf', () => () => null)
jest.mock('../components/ArticleHtml', () => () => null)
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }))
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }))
jest.mock('../infrastructure/material/articleFile', () => ({
  loadArticleFile: jest.fn(), releaseArticleFile: jest.fn(), saveArticleFile: jest.fn(), shareArticleFile: jest.fn(),
}))

const material = { id: 1, title: 'Guia', author: 'BabyBuddy', category: 'Saúde', contentUrl: '/conteudo', contentType: 'text/html', pdfUrl: '/pdf' }
const props = { route: { params: { materialId: 1 } }, navigation: { goBack: jest.fn() } }
const originalOS = Platform.OS
beforeEach(() => {
  jest.clearAllMocks()
  Platform.OS = 'android'
  obterMaterial.mockResolvedValue(material)
  loadArticleHtml.mockResolvedValue('<p>Conteúdo</p>')
  loadArticleFile.mockResolvedValue({ uri: 'file:///artigo.pdf' })
  jest.spyOn(Alert, 'alert').mockImplementation(() => {})
})
afterEach(() => { Platform.OS = originalOS; jest.restoreAllMocks() })

it('lê o HTML sem baixar PDF e reutiliza o PDF entre download e compartilhamento', async () => {
  const screen = render(<MaterialDetailScreen {...props} />)
  await screen.findByText('Guia')
  expect(loadArticleHtml).toHaveBeenCalledWith('/conteudo', expect.anything())
  expect(loadArticleFile).not.toHaveBeenCalled()
  saveArticleFile.mockResolvedValue(true)
  fireEvent.press(screen.getByText('Baixar PDF'))
  await waitFor(() => expect(saveArticleFile).toHaveBeenCalled())
  await screen.findByText('Baixar PDF')
  fireEvent.press(screen.getByText('Compartilhar no WhatsApp'))
  await waitFor(() => expect(shareArticleFile).toHaveBeenCalledWith({ uri: 'file:///artigo.pdf' }, material))
  expect(loadArticleFile).toHaveBeenCalledTimes(1)
})

it('cancelar o salvamento não apresenta sucesso', async () => {
  saveArticleFile.mockResolvedValue(false)
  const screen = render(<MaterialDetailScreen {...props} />)
  fireEvent.press(await screen.findByText('Baixar PDF'))
  await waitFor(() => expect(saveArticleFile).toHaveBeenCalled())
  expect(Alert.alert).not.toHaveBeenCalled()
})

it('mantém leitura do artigo disponível quando não há PDF para download', async () => {
  obterMaterial.mockResolvedValue({ ...material, pdfUrl: '' })
  const screen = render(<MaterialDetailScreen {...props} />)
  await screen.findByText('Guia')
  expect(loadArticleHtml).toHaveBeenCalled()
  expect(screen.queryByText('Baixar PDF')).toBeNull()
})

it('mostra imagem enviada como conteúdo do artigo sem tentar lê-la como texto', async () => {
  obterMaterial.mockResolvedValue({ ...material, contentType: 'image/png', pdfUrl: '' })
  const screen = render(<MaterialDetailScreen {...props} />)
  await screen.findByText('Guia')
  expect(loadArticleHtml).not.toHaveBeenCalled()
})

it('não abre o compartilhamento se a tela fechar durante o download', async () => {
  let finish
  loadArticleFile.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const screen = render(<MaterialDetailScreen {...props} />)
  fireEvent.press(await screen.findByText('Compartilhar no WhatsApp'))
  screen.unmount()
  await act(async () => { finish({ uri: 'file:///artigo.pdf' }) })
  expect(shareArticleFile).not.toHaveBeenCalled()
})
