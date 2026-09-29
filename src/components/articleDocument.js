export function articleHtml(body, url) {
  const base = String(url).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  // The API sanitizes the body. CSP and the WebView/iframe sandbox also disable active content.
  return `<!doctype html><html lang="pt-BR"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: http: data:; style-src 'unsafe-inline'; base-uri http: https:; form-action 'none'">
    <base href="${base}" target="_blank">
    <style>body{margin:0;padding:16px;font:17px/1.65 system-ui,sans-serif;color:#2d1220;overflow-wrap:anywhere}
    img{max-width:100%;height:auto}table{display:block;max-width:100%;overflow:auto;border-collapse:collapse}
    td,th{border:1px solid #ddd;padding:8px}pre{white-space:pre-wrap}a{color:#9b315f}h1,h2,h3{line-height:1.25}</style>
    </head><body>${body}</body></html>`
}

export async function loadArticleHtml(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('Não foi possível carregar o artigo.')
  if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
    throw new Error('O formato do artigo não corresponde ao conteúdo de leitura.')
  }
  return articleHtml(await response.text(), url)
}
