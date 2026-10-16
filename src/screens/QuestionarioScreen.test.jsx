import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import QuestionarioScreen from './QuestionarioScreen'
import NotificationsScreen from './NotificationsScreen'
import { useQuestionario } from '../context/QuestionarioContext'
import { calcularDpp } from '../domain/questionario/Questionario'

jest.mock('../context/QuestionarioContext', () => ({ useQuestionario: jest.fn() }))
jest.mock('../context/AppContext', () => ({ useApp: () => ({ reminders: [], events: [] }) }))
jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }))
jest.mock('../components/Icon', () => ({ Icon: () => null }))
jest.mock('expo-linear-gradient', () => {
  const React = require('react')
  return { LinearGradient: props => React.createElement(require('react-native').View, props) }
})

const navigation = { canGoBack: jest.fn(() => false), goBack: jest.fn(), replace: jest.fn(), navigate: jest.fn() }
let context

beforeEach(() => {
  jest.clearAllMocks()
  context = {
    gestante: null, questionario: null, draft: null, extras: {}, ready: true, loading: false,
    error: '', storageError: '', saving: false, pending: true,
    refresh: jest.fn(), saveDraft: jest.fn().mockResolvedValue(true), submit: jest.fn().mockResolvedValue(true),
  }
  useQuestionario.mockImplementation(() => context)
})

it('oferece adiamento sem enviar dados nem bloquear o acesso ao app', () => {
  const view = render(<QuestionarioScreen navigation={navigation} />)
  fireEvent.press(view.getByText('Responder depois'))
  expect(navigation.replace).toHaveBeenCalledWith('Main')
  expect(context.submit).not.toHaveBeenCalled()
})

it('valida a etapa, salva o progresso e permite retomar na mesma pergunta', async () => {
  const view = render(<QuestionarioScreen navigation={navigation} />)
  fireEvent.press(view.getByText('Responder agora'))
  fireEvent.press(view.getByText('Continuar'))
  expect(view.getByRole('alert').props.children).toContain('data válida')
  fireEvent.changeText(view.getByLabelText('Qual é a sua data de nascimento?'), '20051996')
  fireEvent.press(view.getByText('Continuar'))
  fireEvent.press(view.getByText('Salvar e continuar depois'))
  await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Main'))
  const [dados, campo] = context.saveDraft.mock.calls.at(-1)
  expect(campo).toBe('tipoSanguineo')
  context.draft = { dados, campo }
  view.unmount()
  const resumed = render(<QuestionarioScreen navigation={navigation} />)
  fireEvent.press(resumed.getByText('Continuar questionário'))
  expect(resumed.getByText('Qual o seu tipo sanguíneo?')).toBeTruthy()
})

it('percorre o formulário, aceita Não à personalização e mantém respostas após falha de envio', async () => {
  const view = render(<QuestionarioScreen navigation={navigation} />)
  const next = () => fireEvent.press(view.getByText('Continuar'))
  const choose = value => { fireEvent.press(view.getByRole('radio', { name: value })); next() }
  fireEvent.press(view.getByText('Responder agora'))
  fireEvent.changeText(view.getByLabelText('Qual é a sua data de nascimento?'), '20051996'); next()
  choose('O+'); choose('Não'); choose('Sim')
  fireEvent.changeText(view.getByLabelText('Você está em qual semana de gestação?'), '24'); next()
  expect(view.getByLabelText('Qual é a data prevista para o parto?').props.value).toBe(calcularDpp(24).split('-').reverse().join('/'))
  next(); choose('Não') // pula a condição de saúde
  expect(view.getByText('Você realiza acompanhamento pré-natal regularmente?')).toBeTruthy()
  choose('Sim'); choose('Não'); choose('Sim'); choose('Não')
  fireEvent.press(view.getByText('Ler Termos de Uso'))
  expect(navigation.navigate).toHaveBeenCalledWith('Terms')
  fireEvent.press(view.getByRole('checkbox'))
  context.submit.mockRejectedValueOnce(new Error('Offline'))
  fireEvent.press(view.getByText('Finalizar questionário'))
  await waitFor(() => expect(view.getByRole('alert').props.children).toContain('Suas respostas foram mantidas'))
  expect(context.submit).toHaveBeenCalledWith(expect.objectContaining({ autorizaUsoDados: 'Não', aceitouTermos: true, dataNascimento: '1996-05-20' }))
  fireEvent.press(view.getByText('Finalizar questionário'))
  await waitFor(() => expect(view.getByText('Tudo pronto!')).toBeTruthy())
})

it('prefaz a revisão com os dados enviados anteriormente', () => {
  context.gestante = { dataNascimento: '1996-05-20', tipoSanguineo: 'O+' }
  context.questionario = { id: 5, aceiteTermos: true }
  const view = render(<QuestionarioScreen navigation={navigation} />)
  fireEvent.press(view.getByText('Revisar questionário'))
  expect(view.getByLabelText('Qual é a sua data de nascimento?').props.value).toBe('20/05/1996')
})

it('permite adiar mesmo durante falha ou demora na consulta', () => {
  context.loading = true
  const view = render(<QuestionarioScreen navigation={navigation} />)
  fireEvent.press(view.getByText('Responder depois'))
  expect(navigation.replace).toHaveBeenCalledWith('Main')
})

it('mantém a notificação acionável até concluir e só então mostra o estado vazio', () => {
  const view = render(<NotificationsScreen navigation={navigation} />)
  expect(view.queryByText('Sem notificações')).toBeNull()
  fireEvent.press(view.getByText('Responder questionário'))
  expect(navigation.navigate).toHaveBeenCalledWith('Questionario')
  context.pending = false
  view.rerender(<NotificationsScreen navigation={navigation} />)
  expect(view.queryByText('Questionário de saúde pendente')).toBeNull()
  expect(view.getByText('Sem notificações')).toBeTruthy()
})
