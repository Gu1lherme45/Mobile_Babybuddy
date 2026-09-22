import { materialFromDTO } from '../../domain/material/Material'
import MaterialRepository from '../../infrastructure/repositories/MaterialRepository'

export default async function obterMaterial(id) {
  return materialFromDTO(await MaterialRepository.findPublicById(id))
}
