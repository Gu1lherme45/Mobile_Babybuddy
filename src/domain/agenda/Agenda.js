// O backend só tem 5 tipos fixos de Evento (consulta/exame/ultrassom/vacinacao/outro).
// As categorias de AddReminderScreen (Medicamento/Consulta/Exame/Outro) não batem 1:1 —
// "Medicamento" cai em "outro" (perda de granularidade documentada e aceita).
const CATEGORIA_PARA_TIPO_EVENTO = {
  Consulta: 'consulta',
  Exame: 'exame',
  Medicamento: 'outro',
  Outro: 'outro',
}

function categoriaParaTipoEvento(categoria) {
  return CATEGORIA_PARA_TIPO_EVENTO[categoria] || 'outro'
}

function combinarDataHora(date, time) {
  if (!date) return null
  const hora = time && /^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, '0') : '00:00'
  return `${date}T${hora}:00`
}

// "local" (evento) e "notes" (evento) não têm coluna própria em Agenda — ambos
// cabem em "informacao" (200 chars). "color"/"cat"/"done" (lembrete) continuam
// só locais, anexados pelo AppContext via o id remoto retornado em fromDTO.
function montarInformacao({ notes, local }) {
  return [local, notes].filter(Boolean).join(' — ') || null
}

function toPayload(dadosLocal, usuarioId, eventoId) {
  return {
    usuario: { id: usuarioId },
    evento: { id: eventoId },
    titulo: dadosLocal.title,
    informacao: montarInformacao(dadosLocal),
    dataAgendada: combinarDataHora(dadosLocal.date, dadosLocal.time),
  }
}

function fromDTO(dto) {
  const [date, horaCompleta] = (dto.dataAgendada || '').split('T')
  return {
    id: dto.id,
    title: dto.titulo,
    date: date || '',
    time: horaCompleta ? horaCompleta.slice(0, 5) : '',
    informacao: dto.informacao,
    tipoEvento: dto.evento?.tipoEvento,
    statusAgenda: dto.statusAgenda,
    usuarioId: dto.usuario?.id ?? null,
  }
}

const Agenda = { categoriaParaTipoEvento, combinarDataHora, montarInformacao, toPayload, fromDTO }

export default Agenda
