import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import QuestionarioResumo from './QuestionarioResumo'
import { obterQuestionarioDoUsuario } from '../application/questionario'

jest.mock('../application/questionario', () => ({ obterQuestionarioDoUsuario: jest.fn() }))
jest.mock('./Icon', () => ({ Icon: () => null }))
jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react')
  return { useFocusEffect: (effect) => useEffect(effect, [effect]) }
})

function dataDaquiA(dias) {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

describe('QuestionarioResumo', () => {
  afterEach(() => jest.clearAllMocks())

  it('mostra as respostas do questionário respondido no site', async () => {
    const dataPrevistaParto = dataDaquiA(112)
    obterQuestionarioDoUsuario.mockResolvedValue({
      id: 11,
      dataPrevistaParto,
      primeiraGestacao: 'Sim',
      tipoSanguineo: 'O+',
      condicaoSaude: 'Outra',
      condicaoSaudeOutra: 'Asma',
      prenatalRegular: 'Ainda não iniciei',
      possuiAlergia: 'Sim',
      alergiaEspecificacao: 'Dipirona',
      dataPreenchimento: '2026-10-14T09:30:00',
    })

    const { findByText, getByText } = render(<QuestionarioResumo usuarioId={3} />)

    expect(await findByText('Respondido no site em 14/10/2026')).toBeTruthy()
    expect(obterQuestionarioDoUsuario).toHaveBeenCalledWith(3)
    const [ano, mes, dia] = dataPrevistaParto.split('-')
    expect(getByText('24ª semana')).toBeTruthy()
    expect(getByText(`${dia}/${mes}/${ano}`)).toBeTruthy()
    expect(getByText('O+')).toBeTruthy()
    expect(getByText('Asma')).toBeTruthy()
    expect(getByText('Ainda não iniciei')).toBeTruthy()
    expect(getByText('Dipirona')).toBeTruthy()
  })

  it('avisa quando a usuária ainda não respondeu o questionário', async () => {
    obterQuestionarioDoUsuario.mockResolvedValue(null)

    const { findByText } = render(<QuestionarioResumo usuarioId={3} />)

    expect(await findByText(/ainda não respondeu o questionário de saúde/)).toBeTruthy()
  })

  it('mostra erro e permite tentar de novo quando a busca falha', async () => {
    obterQuestionarioDoUsuario
      .mockRejectedValueOnce(new Error('sem conexão'))
      .mockResolvedValueOnce({ id: 1, tipoSanguineo: 'A+', dataPreenchimento: '2026-10-01T08:00:00' })

    const { findByText } = render(<QuestionarioResumo usuarioId={3} />)

    expect(await findByText('Não foi possível carregar suas respostas agora.')).toBeTruthy()
    fireEvent.press(await findByText('Tentar novamente'))

    expect(await findByText('A+')).toBeTruthy()
    expect(obterQuestionarioDoUsuario).toHaveBeenCalledTimes(2)
  })
})
