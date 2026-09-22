import { materialFromDTO } from '../../domain/material/Material'
import MaterialRepository from '../../infrastructure/repositories/MaterialRepository'

export default async function listarMateriais() {
  const materials = await MaterialRepository.listPublic()
  return materials.map(materialFromDTO)
}
