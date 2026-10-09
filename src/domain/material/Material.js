import { getApiUrl } from '../../config'

export function materialFromDTO(dto) {
  const contentUrl = absoluteUrl(dto.conteudoUrl || dto.arquivo)
  const pdfPath = dto.pdfUrl !== undefined
    ? dto.pdfUrl
    : (!dto.conteudoMimeType && (!dto.mimeType || dto.mimeType === 'application/pdf') ? dto.arquivo : '')
  // The backend generates a PDF on demand for articles that have readable content.
  const contentType = dto.conteudoMimeType || dto.mimeType || 'application/pdf'
  const generatedPdfPath = pdfPath || (contentUrl && dto.id && contentType.startsWith('text/') ? `/api/materiais/${dto.id}/pdf` : '')
  return {
    id: dto.id,
    title: dto.titulo || '',
    description: dto.descricao || '',
    category: dto.categoria || '',
    author: dto.autor || 'BabyBuddy',
    publishedAt: dto.dataPublicacao || null,
    coverUrl: absoluteUrl(dto.imagem || dto.capa),
    contentUrl,
    contentType,
    fileName: dto.nomeArquivo || '',
    pdfUrl: absoluteUrl(generatedPdfPath),
    downloadHeaders: dto.downloadHeaders || {},
    legacyPath: dto.link || '',
  }
}

export function absoluteUrl(path) {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : `${getApiUrl()}${path.startsWith('/') ? '' : '/'}${path}`
}
