export default function ArticleHtml({ html, onError }) {
  return <iframe title="Conteúdo do artigo" srcDoc={html} onError={onError}
    sandbox="allow-popups allow-popups-to-escape-sandbox"
    style={{ width: '100%', height: 600, border: 0, borderRadius: 16 }} />
}
