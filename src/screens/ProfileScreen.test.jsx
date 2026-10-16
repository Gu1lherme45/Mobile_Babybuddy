import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { Alert, Platform } from 'react-native'
import ProfileScreen from './ProfileScreen'
import { useApp } from '../context/AppContext'
import { useQuestionario } from '../context/QuestionarioContext'

jest.mock('../context/AppContext', () => ({ useApp: jest.fn() }))
jest.mock('../context/QuestionarioContext', () => ({ useQuestionario: jest.fn(() => ({ pending: false })) }))
jest.mock('../components/Icon', () => ({ Icon: () => null }))
jest.mock('../components/QuestionarioResumo', () => {
  const React = require('react')
  const { Text } = require('react-native')
  return ({ usuarioId }) => React.createElement(Text, null, `questionário da usuária ${usuarioId}`)
})
jest.mock('expo-linear-gradient', () => {
  const React = require('react')
  const { View } = require('react-native')
  return { LinearGradient: (props) => React.createElement(View, props) }
})

describe('ProfileScreen — questionário de saúde', () => {
  it('mostra o resumo do questionário da usuária logada', () => {
    useApp.mockReturnValue({ currentUser: { id: 3, nome: 'Lorena', email: 'lorena@a.com' }, logout: jest.fn() })
    const { getByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)

    expect(getByText('MINHA SAÚDE')).toBeTruthy()
    expect(getByText('questionário da usuária 3')).toBeTruthy()
  })

  it.each([true, false])('mantém o resumo e permite abrir o formulário com pendência %s', pending => {
    useApp.mockReturnValue({ currentUser: { id: 3 }, logout: jest.fn() })
    useQuestionario.mockReturnValueOnce({ pending })
    const navigate = jest.fn()
    const { getByText } = render(<ProfileScreen navigation={{ navigate }} />)

    expect(getByText('questionário da usuária 3')).toBeTruthy()
    fireEvent.press(getByText(pending ? 'Questionário de saúde · Pendente' : 'Questionário de saúde'))
    expect(navigate).toHaveBeenCalledWith('Questionario')
  })
})

describe('ProfileScreen — sair', () => {
  const originalPlatform = Platform.OS
  const originalConfirm = globalThis.confirm
  const logout = jest.fn()

  beforeEach(() => {
    logout.mockReset()
    useApp.mockReturnValue({
      currentUser: { nome: 'Lorena', email: 'lorena@a.com' },
      logout,
    })
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform })
    globalThis.confirm = originalConfirm
  })

  it('faz logout quando a usuária confirma no navegador', () => {
    globalThis.confirm = jest.fn(() => true)
    const { getByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)

    fireEvent.press(getByText('Sair'))

    expect(globalThis.confirm).toHaveBeenCalledWith('Tem certeza que deseja sair?')
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('mantém a sessão quando a usuária cancela no navegador', () => {
    globalThis.confirm = jest.fn(() => false)
    const { getByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)

    fireEvent.press(getByText('Sair'))

    expect(logout).not.toHaveBeenCalled()
  })

  it('mantém a confirmação nativa no Android', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' })
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    const { getByText } = render(<ProfileScreen navigation={{ navigate: jest.fn() }} />)

    fireEvent.press(getByText('Sair'))

    expect(alert).toHaveBeenCalledWith(
      'Sair',
      'Tem certeza que deseja sair?',
      expect.any(Array)
    )
    alert.mock.calls[0][2][1].onPress()
    expect(logout).toHaveBeenCalledTimes(1)
  })
})
