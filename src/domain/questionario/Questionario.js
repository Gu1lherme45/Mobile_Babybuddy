export const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const SIM_NAO = ['Sim', 'Não']

export const ESTADO_INICIAL = {
  dataNascimento: '', tipoSanguineo: '', jaTeveParto: '', primeiraGestacao: '',
  semanaGestacao: '', dpp: '', possuiProblemaSaude: '', condicaoSaude: '',
  outraCondicao: '', acompanhamentoPreNatal: '', possuiAlergia: '', alergia: '',
  cicloRegular: '', autorizaUsoDados: '', aceitouTermos: false,
}

export const ETAPAS = [
  { campo: 'dataNascimento', pergunta: 'Qual é a sua data de nascimento?', tipo: 'date' },
  { campo: 'tipoSanguineo', pergunta: 'Qual o seu tipo sanguíneo?', tipo: 'options', opcoes: TIPOS_SANGUINEOS },
  { campo: 'jaTeveParto', pergunta: 'Você já teve algum parto?', tipo: 'options', opcoes: SIM_NAO },
  { campo: 'primeiraGestacao', pergunta: 'Esta é sua primeira gestação?', tipo: 'options', opcoes: SIM_NAO },
  { campo: 'semanaGestacao', pergunta: 'Você está em qual semana de gestação?', tipo: 'weeks' },
  { campo: 'dpp', pergunta: 'Qual é a data prevista para o parto?', tipo: 'date' },
  { campo: 'possuiProblemaSaude', pergunta: 'Possui algum problema de saúde?', tipo: 'options', opcoes: SIM_NAO },
  {
    campo: 'condicaoSaude', pergunta: 'Qual condição de saúde requer acompanhamento durante a gestação?', tipo: 'options',
    opcoes: ['Hipertensão', 'Diabetes gestacional', 'Anemia', 'Outra'],
    condicional: { valor: 'Outra', campo: 'outraCondicao', label: 'Qual condição de saúde?' },
  },
  { campo: 'acompanhamentoPreNatal', pergunta: 'Você realiza acompanhamento pré-natal regularmente?', tipo: 'options', opcoes: ['Sim', 'Ainda não iniciei', 'Não'] },
  {
    campo: 'possuiAlergia', pergunta: 'Você possui alguma alergia a medicamentos ou alimentos?', tipo: 'options', opcoes: ['Não', 'Sim'],
    condicional: { valor: 'Sim', campo: 'alergia', label: 'Qual alergia?' },
  },
  { campo: 'cicloRegular', pergunta: 'Seu ciclo menstrual costuma ser regular?', tipo: 'options', opcoes: SIM_NAO },
  { campo: 'autorizaUsoDados', pergunta: 'Você autoriza o uso dessas informações para personalização de conteúdos?', tipo: 'options', opcoes: SIM_NAO },
  { campo: 'aceitouTermos', pergunta: 'Termos de Uso e Política de Privacidade', tipo: 'checkbox' },
]

const semAcento = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function dataLocal(data = new Date()) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export function exibirData(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor.split('-').reverse().join('/') : valor
}

export function digitarData(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)
  if (digitos.length === 8) return `${digitos.slice(4)}-${digitos.slice(2, 4)}-${digitos.slice(0, 2)}`
  return digitos.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2')
}

function dataValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const [ano, mes, dia] = valor.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
}

export function calcularIdade(nascimento, hoje = new Date()) {
  const [ano, mes, dia] = nascimento.split('-').map(Number)
  return hoje.getFullYear() - ano - (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia) ? 1 : 0)
}

export function calcularDpp(semanas, hoje = new Date()) {
  const data = new Date(hoje)
  data.setDate(data.getDate() + (40 - Number(semanas)) * 7)
  return dataLocal(data)
}

export function etapasVisiveis(dados) {
  return ETAPAS.filter(etapa => etapa.campo !== 'condicaoSaude' || dados.possuiProblemaSaude !== 'Não')
}

export function alterarResposta(dados, campo, valor, hoje = new Date()) {
  const proximo = { ...dados, [campo]: valor }
  if (campo === 'semanaGestacao' && /^\d+$/.test(valor) && Number(valor) >= 1 && Number(valor) <= 42) proximo.dpp = calcularDpp(valor, hoje)
  if (campo === 'possuiProblemaSaude') {
    proximo.condicaoSaude = valor === 'Não' ? 'Não' : ''
    proximo.outraCondicao = ''
  }
  if (campo === 'condicaoSaude' && valor !== 'Outra') proximo.outraCondicao = ''
  if (campo === 'possuiAlergia' && valor !== 'Sim') proximo.alergia = ''
  return proximo
}

export function validarEtapa(etapa, dados, hoje = new Date()) {
  const valor = dados[etapa.campo]
  if (etapa.tipo === 'options' && !etapa.opcoes.includes(valor)) return 'Selecione uma opção.'
  if (etapa.tipo === 'weeks' && (!/^\d+$/.test(valor) || Number(valor) < 1 || Number(valor) > 42)) return 'Informe uma semana de 1 a 42.'
  if (etapa.tipo === 'date') {
    if (!dataValida(valor)) return 'Informe uma data válida no formato DD/MM/AAAA.'
    if (etapa.campo === 'dataNascimento') {
      if (valor > dataLocal(hoje)) return 'A data de nascimento não pode ser no futuro.'
      if (calcularIdade(valor, hoje) < 13) return 'Você precisa ter pelo menos 13 anos para usar o BabyBuddy.'
    } else {
      const diferenca = Math.abs(Date.parse(`${valor}T00:00:00Z`) - Date.parse(`${calcularDpp(dados.semanaGestacao, hoje)}T00:00:00Z`)) / 86400000
      if (!Number.isFinite(diferenca) || diferenca > 7) return 'A data prevista do parto não corresponde à semana de gestação informada. Confira os dois campos.'
      // A DPP calculada pode ter passado nas semanas 41 e 42.
    }
  }
  if (etapa.tipo === 'checkbox' && valor !== true) return 'É necessário aceitar os Termos de Uso e a Política de Privacidade.'
  if (etapa.condicional && valor === etapa.condicional.valor) {
    const extra = dados[etapa.condicional.campo]?.trim()
    if (!extra) return 'Preencha o campo de detalhes para continuar.'
    if (extra.length > 200) return 'Use no máximo 200 caracteres.'
  }
  return ''
}

export function validarQuestionario(dados, hoje = new Date()) {
  for (const etapa of etapasVisiveis(dados)) {
    const mensagem = validarEtapa(etapa, dados, hoje)
    if (mensagem) return { campo: etapa.campo, mensagem }
  }
  return null
}

export function questionarioMaisRecente(lista) {
  return [...lista].sort((a, b) =>
    (Date.parse(b.dataPreenchimento) || 0) - (Date.parse(a.dataPreenchimento) || 0) || Number(b.id) - Number(a.id)
  )[0] || null
}

export function dadosExistentes(gestante, questionario, extras = {}) {
  const resposta = valor => {
    const normalizado = semAcento(valor).toLowerCase()
    return { sim: 'Sim', nao: 'Não', hipertensao: 'Hipertensão', 'ainda nao iniciei': 'Ainda não iniciei' }[normalizado] || valor || ''
  }
  return {
    ...ESTADO_INICIAL, ...extras,
    dataNascimento: gestante?.dataNascimento || '',
    tipoSanguineo: questionario?.tipoSanguineo || gestante?.tipoSanguineo || '',
    primeiraGestacao: resposta(questionario?.primeiraGestacao),
    semanaGestacao: questionario?.semanaGestacional ? String(questionario.semanaGestacional) : '',
    dpp: questionario?.dataPrevistaParto || '',
    possuiProblemaSaude: questionario?.condicaoSaude ? (resposta(questionario.condicaoSaude) === 'Não' ? 'Não' : 'Sim') : '',
    condicaoSaude: resposta(questionario?.condicaoSaude),
    outraCondicao: questionario?.condicaoSaudeOutra || '',
    acompanhamentoPreNatal: resposta(questionario?.prenatalRegular),
    possuiAlergia: resposta(questionario?.possuiAlergia),
    alergia: questionario?.alergiaEspecificacao || '',
    aceitouTermos: questionario?.aceiteTermos === true,
  }
}

export function respostasLocais(dados) {
  // Estes três campos também não são enviados pela versão Web: não existem na API.
  return { jaTeveParto: dados.jaTeveParto, cicloRegular: dados.cicloRegular, autorizaUsoDados: dados.autorizaUsoDados }
}

export function toPayload(dados, gestanteId, hoje = new Date()) {
  return {
    gestante: { id: gestanteId }, idade: calcularIdade(dados.dataNascimento, hoje),
    tipoSanguineo: dados.tipoSanguineo, semanaGestacional: Number(dados.semanaGestacao),
    primeiraGestacao: semAcento(dados.primeiraGestacao).toLowerCase(), dataPrevistaParto: dados.dpp,
    condicaoSaude: dados.possuiProblemaSaude === 'Não' ? 'Nao' : semAcento(dados.condicaoSaude),
    condicaoSaudeOutra: dados.possuiProblemaSaude === 'Sim' && dados.condicaoSaude === 'Outra' ? dados.outraCondicao.trim() : null,
    prenatalRegular: semAcento(dados.acompanhamentoPreNatal), possuiAlergia: semAcento(dados.possuiAlergia).toLowerCase(),
    alergiaEspecificacao: dados.possuiAlergia === 'Sim' ? dados.alergia.trim() : null, aceiteTermos: dados.aceitouTermos,
  }
}
