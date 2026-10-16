/** @jest-environment node */
// Execução opt-in contra Postman, com o cliente Axios e os repositórios reais.
import axios from 'axios'
import apiClient from '../../infrastructure/http/apiClient'
import { setCredentials, clearCredentials } from '../../infrastructure/http/credentialsStore'
import { obterAnamnese, obterQuestionarioDoUsuario, salvarAnamnese } from './index'
import { calcularDpp } from '../../domain/questionario/Questionario'

const describeSimulation = process.env.BABYBUDDY_SIMULATION_URL ? describe : describe.skip

describeSimulation('Anamnese — HTTP real contra simulação Postman', () => {
  const baseURL = process.env.BABYBUDDY_SIMULATION_URL
  const control = axios.create({ baseURL, adapter: 'http' })
  const dados = {
    dataNascimento: '1996-05-20', tipoSanguineo: 'O+', jaTeveParto: 'Não', primeiraGestacao: 'Sim',
    semanaGestacao: '24', dpp: calcularDpp(24), possuiProblemaSaude: 'Sim', condicaoSaude: 'Hipertensão',
    outraCondicao: '', acompanhamentoPreNatal: 'Ainda não iniciei', possuiAlergia: 'Sim', alergia: 'Dipirona',
    cicloRegular: 'Sim', autorizaUsoDados: 'Não', aceitouTermos: true,
  }

  beforeEach(async () => {
    apiClient.defaults.baseURL = baseURL
    apiClient.defaults.adapter = 'http'
    apiClient.defaults.timeout = 5000
    setCredentials('fixture@example.test', 'Ficticia@123')
    await control.post('/__test/reset', {})
  })
  afterAll(() => clearCredentials())

  it('cria, lê e revisa sem duplicar a gestante ou o questionário', async () => {
    expect(await obterAnamnese(7)).toEqual({ gestante: null, questionario: null })
    const created = await salvarAnamnese(7, dados)
    expect(created.questionario).toMatchObject({ condicaoSaude: 'Hipertensao', prenatalRegular: 'Ainda nao iniciei', possuiAlergia: 'sim' })
    const saved = await obterAnamnese(7)
    expect(saved.questionario.id).toBe(created.questionario.id)
    expect(await obterQuestionarioDoUsuario(7)).toMatchObject({
      id: created.questionario.id, tipoSanguineo: 'O+', condicaoSaude: 'Hipertensão',
      prenatalRegular: 'Ainda não iniciei', possuiAlergia: 'Sim', alergiaEspecificacao: 'Dipirona',
    })
    const updated = await salvarAnamnese(7, { ...dados, tipoSanguineo: 'A+' })
    expect(updated.questionario).toMatchObject({ id: created.questionario.id, tipoSanguineo: 'A+' })
    expect(await obterQuestionarioDoUsuario(7)).toMatchObject({ id: created.questionario.id, tipoSanguineo: 'A+' })
    const { data: state } = await control.get('/__test/state')
    expect(state.gestantes).toHaveLength(1)
    expect(state.questionarios).toHaveLength(1)
  })

  it('filtra a gestante da usuária e conserva as observações existentes', async () => {
    await control.post('/__test/reset', { gestantes: [
      { id: 40, usuario: { id: 88 }, observacoes: 'Outra pessoa' },
      { id: 41, usuario: { id: 7 }, observacoes: 'Médica e hospital existentes' },
    ] })
    const saved = await salvarAnamnese(7, dados)
    expect(saved.gestante).toMatchObject({ id: 41, observacoes: 'Médica e hospital existentes' })
    expect(saved.questionario.gestante.id).toBe(41)
  })

  it('reutiliza a gestante se o primeiro envio falhar depois de criá-la', async () => {
    await control.post('/__test/fail', { method: 'POST', path: '/api/questionarios', status: 503 })
    await expect(salvarAnamnese(7, dados)).rejects.toThrow()
    await salvarAnamnese(7, dados)
    const { data: state } = await control.get('/__test/state')
    expect(state.gestantes).toHaveLength(1)
    expect(state.questionarios).toHaveLength(1)
  })

  it('não cria registros se não conseguir consultar os dados existentes', async () => {
    await control.post('/__test/fail', { method: 'GET', path: '/api/gestantes', status: 503 })
    await expect(salvarAnamnese(7, dados)).rejects.toThrow()
    const { data: state } = await control.get('/__test/state')
    expect(state.requests).toEqual([{ method: 'GET', path: '/api/gestantes' }])
    expect(state.gestantes).toHaveLength(0)
  })
})
