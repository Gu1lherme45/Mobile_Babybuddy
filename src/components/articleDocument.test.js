import { loadArticleHtml } from './articleDocument'
const originalFetch = global.fetch
afterEach(() => { global.fetch = originalFetch })
it('carrega HTML com bloqueio de scripts e layout responsivo', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, headers: { get: () => 'text/html;charset=UTF-8' }, text: async () => '<p>Artigo</p>' })
  const html = await loadArticleHtml('https://api.test/conteudo')
  expect(html).toContain('<p>Artigo</p>')
  expect(html).toContain("default-src 'none'")
  expect(html).toContain('width=device-width')
})
it('rejeita respostas de erro e conteúdo inesperado', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/pdf' } })
  await expect(loadArticleHtml('/artigo')).rejects.toThrow('carregar')
  await expect(loadArticleHtml('/artigo')).rejects.toThrow('formato')
})
