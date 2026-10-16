import { alterarResposta, calcularDpp, dadosExistentes, digitarData, etapasVisiveis, exibirData, questionarioMaisRecente, toPayload, validarQuestionario } from './Questionario'

const hoje = new Date(2026, 9, 16, 12)
const respostas = {
  dataNascimento: '1996-05-20', tipoSanguineo: 'O+', jaTeveParto: 'Não', primeiraGestacao: 'Sim',
  semanaGestacao: '24', dpp: calcularDpp(24, hoje), possuiProblemaSaude: 'Não', condicaoSaude: 'Não',
  outraCondicao: '', acompanhamentoPreNatal: 'Ainda não iniciei', possuiAlergia: 'Não', alergia: '',
  cicloRegular: 'Sim', autorizaUsoDados: 'Não', aceitouTermos: true,
}

it('aceita a recusa de personalização e envia somente o contrato normalizado do Web', () => {
  expect(validarQuestionario(respostas, hoje)).toBeNull()
  expect(toPayload(respostas, 9, hoje)).toEqual({
    gestante: { id: 9 }, idade: 30, tipoSanguineo: 'O+', semanaGestacional: 24, primeiraGestacao: 'sim',
    dataPrevistaParto: respostas.dpp, condicaoSaude: 'Nao', condicaoSaudeOutra: null,
    prenatalRegular: 'Ainda nao iniciei', possuiAlergia: 'nao', alergiaEspecificacao: null, aceiteTermos: true,
  })
})

it.each([
  ['dataNascimento', '2026-02-30', 'dataNascimento'],
  ['dataNascimento', '2027-01-01', 'dataNascimento'],
  ['dataNascimento', '2013-10-17', 'dataNascimento'],
  ['semanaGestacao', '0', 'semanaGestacao'],
  ['semanaGestacao', '43', 'semanaGestacao'],
  ['dpp', '2028-01-01', 'dpp'],
  ['aceitouTermos', false, 'aceitouTermos'],
])('rejeita %s = %s e indica a etapa a corrigir', (campo, valor, esperado) => {
  expect(validarQuestionario({ ...respostas, [campo]: valor }, hoje)?.campo).toBe(esperado)
})

it('aceita o aniversário de 13 anos e DPP compatível nas semanas 41 e 42', () => {
  for (const semana of [41, 42]) {
    expect(validarQuestionario({ ...respostas, dataNascimento: '2013-10-16', semanaGestacao: String(semana), dpp: calcularDpp(semana, hoje) }, hoje)).toBeNull()
  }
})

it('pula condição de saúde quando a resposta é Não e elimina detalhes antigos', () => {
  const dados = alterarResposta({ ...respostas, possuiProblemaSaude: 'Sim', condicaoSaude: 'Outra', outraCondicao: 'Anterior' }, 'possuiProblemaSaude', 'Não')
  expect(etapasVisiveis(dados)).toHaveLength(12)
  expect(dados.condicaoSaude).toBe('Não')
  expect(dados.outraCondicao).toBe('')
  expect(alterarResposta({ ...dados, alergia: 'Anterior' }, 'possuiAlergia', 'Não').alergia).toBe('')
})

it('exige e normaliza os detalhes condicionais', () => {
  const dados = { ...respostas, possuiProblemaSaude: 'Sim', condicaoSaude: 'Outra', outraCondicao: '  ' }
  expect(validarQuestionario(dados, hoje)?.campo).toBe('condicaoSaude')
  dados.outraCondicao = ' Outra condição '
  dados.possuiAlergia = 'Sim'
  expect(validarQuestionario(dados, hoje)?.campo).toBe('possuiAlergia')
  dados.alergia = ' Dipirona '
  expect(validarQuestionario(dados, hoje)).toBeNull()
  expect(toPayload(dados, 9, hoje)).toMatchObject({ condicaoSaudeOutra: 'Outra condição', alergiaEspecificacao: 'Dipirona' })
})

it('mantém datas locais e recalcula a previsão ao alterar a semana', () => {
  expect(digitarData('20051996')).toBe('1996-05-20')
  expect(exibirData('1996-05-20')).toBe('20/05/1996')
  expect(digitarData('2005')).toBe('20/05')
  expect(alterarResposta(respostas, 'semanaGestacao', '40', hoje).dpp).toBe('2026-10-16')
})

it('carrega o registro mais recente com os acentos de exibição e os extras locais', () => {
  const antigo = { id: 30, dataPreenchimento: '2026-01-01T12:00:00' }
  const atual = { id: 31, dataPreenchimento: '2026-02-01T12:00:00', ...toPayload(respostas, 9, hoje) }
  expect(questionarioMaisRecente([atual, antigo])).toEqual(atual)
  expect(dadosExistentes({ dataNascimento: respostas.dataNascimento }, atual, { cicloRegular: 'Sim' })).toMatchObject({
    primeiraGestacao: 'Sim', possuiProblemaSaude: 'Não', acompanhamentoPreNatal: 'Ainda não iniciei', cicloRegular: 'Sim',
  })
})
