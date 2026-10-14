// O questionário é respondido no site e gravado sem acentos por causa das CHECK
// constraints do banco (ex.: "Hipertensao", "nao", "Ainda nao iniciei").
// Aqui os valores voltam para o texto que a usuária escolheu.
const ROTULOS = {
  sim: 'Sim',
  nao: 'Não',
  hipertensao: 'Hipertensão',
  'diabetes gestacional': 'Diabetes gestacional',
  anemia: 'Anemia',
  outra: 'Outra',
  'ainda nao iniciei': 'Ainda não iniciei',
}

const DIAS_GESTACAO = 280
const MS_POR_DIA = 24 * 60 * 60 * 1000

function rotulo(valor) {
  if (!valor) return ''
  return ROTULOS[String(valor).trim().toLowerCase()] || valor
}

function fromDTO(dto) {
  return {
    id: dto.id,
    semanaGestacional: dto.semanaGestacional ?? null,
    dataPrevistaParto: dto.dataPrevistaParto || '',
    primeiraGestacao: rotulo(dto.primeiraGestacao),
    tipoSanguineo: dto.tipoSanguineo || '',
    condicaoSaude: rotulo(dto.condicaoSaude),
    condicaoSaudeOutra: dto.condicaoSaudeOutra || '',
    prenatalRegular: rotulo(dto.prenatalRegular),
    possuiAlergia: rotulo(dto.possuiAlergia),
    alergiaEspecificacao: dto.alergiaEspecificacao || '',
    dataPreenchimento: dto.dataPreenchimento || '',
  }
}

// A usuária pode revisar o questionário no site; vale o preenchimento mais recente
// (mesmo critério do site em pages/Questionario/Questionario.jsx).
function maisRecente(questionarios) {
  return [...(questionarios || [])].sort((a, b) => {
    const dataA = new Date(a.dataPreenchimento || 0).getTime()
    const dataB = new Date(b.dataPreenchimento || 0).getTime()
    return dataB - dataA || (b.id || 0) - (a.id || 0)
  })[0] || null
}

// A semana gravada é a do dia em que o questionário foi respondido; a semana de
// hoje sai da data prevista do parto (40 semanas = 280 dias). As partes da data
// são lidas direto do texto para não deslocar o dia por causa do fuso horário.
function semanaAtual(dataPrevistaParto, hoje = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dataPrevistaParto || '')) return null
  const [ano, mes, dia] = dataPrevistaParto.slice(0, 10).split('-').map(Number)
  const parto = Date.UTC(ano, mes - 1, dia)
  const dataDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const diasAteOParto = Math.round((parto - dataDeHoje) / MS_POR_DIA)
  const semana = Math.floor((DIAS_GESTACAO - diasAteOParto) / 7)
  return Math.min(Math.max(semana, 1), 42)
}

const Questionario = { rotulo, fromDTO, maisRecente, semanaAtual }

export default Questionario
