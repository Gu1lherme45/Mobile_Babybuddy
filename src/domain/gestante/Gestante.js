const OBSERVACOES_MAX = 200

// Gestante.observacoes é NOT NULL no backend, mas PersonalDataScreen não tem um
// campo "observações" livre — só doctor/hospital/weight/height/allergies, que
// também não têm coluna própria em Gestante. Sintetiza um texto a partir deles.
function montarObservacoes({ doctor, hospital, weight, height, allergies }) {
  const partes = []
  if (doctor) partes.push(`Médico/a: ${doctor}`)
  if (hospital) partes.push(`Hospital/Maternidade: ${hospital}`)
  if (weight) partes.push(`Peso: ${weight}kg`)
  if (height) partes.push(`Altura: ${height}cm`)
  if (allergies) partes.push(`Alergias: ${allergies}`)
  const texto = partes.join(' · ')
  return (texto || 'Sem observações adicionais').slice(0, OBSERVACOES_MAX)
}

function toPayload(form) {
  return {
    dataNascimento: form.birthDate,
    tipoSanguineo: form.blood,
    observacoes: montarObservacoes(form),
  }
}

function fromDTO(dto) {
  return {
    id: dto.id,
    birthDate: dto.dataNascimento,
    blood: dto.tipoSanguineo,
    observacoes: dto.observacoes,
    usuarioId: dto.usuario?.id ?? null,
  }
}

const Gestante = { toPayload, fromDTO }

export default Gestante
