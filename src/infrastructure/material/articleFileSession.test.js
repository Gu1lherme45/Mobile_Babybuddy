import { createArticleFileSession } from './articleFileSession'
import { loadArticleFile, releaseArticleFile } from './articleFile'
jest.mock('./articleFile', () => ({ loadArticleFile: jest.fn(), releaseArticleFile: jest.fn() }))
beforeEach(() => jest.clearAllMocks())

it('reutiliza o download entre ações', async () => {
  const file = { uri: 'file:///artigo.pdf' }
  loadArticleFile.mockResolvedValue(file)
  const session = createArticleFileSession({ pdfUrl: '/pdf' })
  await session.use(async value => expect(value).toBe(file))
  await session.use(async value => expect(value).toBe(file))
  expect(loadArticleFile).toHaveBeenCalledTimes(1)
  session.dispose()
  expect(releaseArticleFile).toHaveBeenCalledWith(file)
})

it('não remove o arquivo enquanto uma ação está pendente mesmo ao sair da tela', async () => {
  const file = { uri: 'file:///artigo.pdf' }
  loadArticleFile.mockResolvedValue(file)
  const session = createArticleFileSession({ pdfUrl: '/pdf' })
  let finish
  const action = session.use(() => new Promise(resolve => { finish = resolve }))
  await new Promise(resolve => setImmediate(resolve))
  session.dispose()
  expect(releaseArticleFile).not.toHaveBeenCalled()
  finish()
  await action
  expect(releaseArticleFile).toHaveBeenCalledWith(file)
})

it('permite tentar novamente depois de falhar o download', async () => {
  loadArticleFile.mockRejectedValueOnce(new Error('rede')).mockResolvedValueOnce({ uri: 'pdf' })
  const session = createArticleFileSession({ pdfUrl: '/pdf' })
  await expect(session.get()).rejects.toThrow('rede')
  await expect(session.get()).resolves.toEqual({ uri: 'pdf' })
})

it('limpa um download de leitura que termina após fechar a tela', async () => {
  let finish
  loadArticleFile.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const session = createArticleFileSession({ pdfUrl: '/pdf' })
  const pending = session.get()
  session.dispose()
  finish({ uri: 'pdf' })
  await pending
  expect(releaseArticleFile).toHaveBeenCalledWith({ uri: 'pdf' })
})
