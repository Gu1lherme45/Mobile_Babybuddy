import GestanteRepository from '../../infrastructure/repositories/GestanteRepository'
import Gestante from '../../domain/gestante/Gestante'

export default async function registrarOuAtualizarGestante(usuarioId, gestanteIdAtual, form) {
  const payload = Gestante.toPayload(form)
  const dto = gestanteIdAtual
    ? await GestanteRepository.atualizar(gestanteIdAtual, payload)
    : await GestanteRepository.criar({ ...payload, usuario: { id: usuarioId } })
  return Gestante.fromDTO(dto)
}
