function fromDTO(dto) {
  return {
    id: dto.id,
    nome: dto.nome,
    email: dto.username,
  }
}

const Usuario = { fromDTO }

export default Usuario
