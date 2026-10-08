import MaterialRepository from '../../infrastructure/repositories/MaterialRepository'

export async function listarCategoriasMaterial() {
  const categories = await MaterialRepository.listCategories()
  return categories.map((category) => category.nome).filter(Boolean)
}

export async function criarCategoriaMaterial(name) {
  const normalized = name?.trim()
  if (!normalized) throw new Error('Informe o nome da categoria.')
  const category = await MaterialRepository.createCategory(normalized)
  return category.nome
}

export default async function cadastrarMaterial(input) {
  const title = input.title?.trim()
  const category = input.category?.trim()
  const author = input.author?.trim()
  if (!title || !category || !author) {
    throw new Error('Preencha título, categoria e autor.')
  }
  if (input.file && !/\.(pdf|html?|md|markdown)$/i.test(input.file.name || '')) {
    throw new Error('Selecione um arquivo PDF, HTML ou Markdown.')
  }
  if (!input.file && !input.content?.trim()) {
    throw new Error('Escreva o conteúdo do artigo ou selecione um arquivo.')
  }
  return MaterialRepository.create({ ...input, title, category, author })
}
