import { API_URL } from '../../config'

export function materialFromDTO(dto) {
  return {
    id: dto.id,
    title: dto.titulo || '',
    description: dto.descricao || '',
    category: dto.categoria || '',
    author: dto.autor || 'BabyBuddy',
    publishedAt: dto.dataPublicacao || null,
    coverUrl: absoluteUrl(dto.capa),
    pdfUrl: absoluteUrl(dto.arquivo),
    legacyPath: dto.link || '',
  }
}

export function absoluteUrl(path) {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
