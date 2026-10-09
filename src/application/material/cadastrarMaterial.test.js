import MaterialRepository from '../../infrastructure/repositories/MaterialRepository'
import cadastrarMaterial from './cadastrarMaterial'

jest.mock('../../infrastructure/repositories/MaterialRepository', () => ({ create: jest.fn() }))

describe('cadastrarMaterial', () => {
  beforeEach(() => jest.clearAllMocks())

  it('valida os campos obrigatórios e exige texto ou arquivo', async () => {
    await expect(cadastrarMaterial({})).rejects.toThrow('título, categoria e autor')
    await expect(cadastrarMaterial({ title: 'Guia', category: 'Saúde', author: 'BabyBuddy' })).rejects.toThrow('Escreva o conteúdo')
    expect(MaterialRepository.create).not.toHaveBeenCalled()
  })

  it('envia metadados e conteúdo escrito ao repositório', async () => {
    MaterialRepository.create.mockResolvedValue({ id: 5 })
    await expect(cadastrarMaterial({ title: ' Guia ', category: ' Saúde ', author: ' BabyBuddy ', content: 'Texto' }))
      .resolves.toEqual({ id: 5 })
    expect(MaterialRepository.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Guia', category: 'Saúde', author: 'BabyBuddy' }))
  })

  it('aceita formatos documentais de material e rejeita extensões não suportadas', async () => {
    MaterialRepository.create.mockResolvedValue({ id: 5 })
    for (const name of ['guia.pdf', 'guia.md', 'foto.jpg', 'foto.png', 'guia.docx']) {
      await expect(cadastrarMaterial({ title: 'Guia', category: 'Saúde', author: 'BabyBuddy', file: { name } }))
        .resolves.toEqual({ id: 5 })
    }
    await expect(cadastrarMaterial({ title: 'Guia', category: 'Saúde', author: 'BabyBuddy', file: { name: 'guia.exe' } }))
      .rejects.toThrow('JPG, PNG, Markdown, PDF ou DOCX')
  })
})
