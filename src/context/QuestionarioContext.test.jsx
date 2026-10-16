import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { AppState } from 'react-native'
import { QuestionarioProvider, useQuestionario } from './QuestionarioContext'
import { useApp } from './AppContext'
import SecureStorage from '../infrastructure/storage/SecureStorage'
import { obterAnamnese, salvarAnamnese } from '../application/questionario'

jest.mock('./AppContext', () => ({ useApp: jest.fn() }))
jest.mock('../application/questionario')
jest.mock('../infrastructure/storage/SecureStorage', () => ({
  __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() },
}))

const storage = new Map()
const setProfile = jest.fn()
const remote = { gestante: { id: 10 }, questionario: { id: 20, aceiteTermos: true } }
const dados = { dataNascimento: '1996-05-20', tipoSanguineo: 'O+', semanaGestacao: '24', dpp: '2027-02-05', possuiAlergia: 'Não', jaTeveParto: 'Não', cicloRegular: 'Sim', autorizaUsoDados: 'Não' }
const setup = () => renderHook(() => useQuestionario(), { wrapper: QuestionarioProvider })

beforeEach(() => {
  jest.resetAllMocks()
  AppState.addEventListener.mockReturnValue({ remove: jest.fn() })
  storage.clear()
  useApp.mockReturnValue({ currentUser: { id: 7 }, profile: { doctor: 'Dra. Ana' }, setProfile })
  SecureStorage.getItem.mockImplementation(async key => storage.get(key) || null)
  SecureStorage.setItem.mockImplementation(async (key, value) => { storage.set(key, value) })
  obterAnamnese.mockResolvedValue({ gestante: null, questionario: null })
  salvarAnamnese.mockResolvedValue(remote)
})

it('restaura o rascunho e mantém a pendência depois de fechar e reabrir', async () => {
  const first = setup()
  await waitFor(() => expect(first.result.current.loading).toBe(false))
  await act(async () => { await first.result.current.saveDraft(dados, 'dpp') })
  expect(first.result.current.pending).toBe(true)
  first.unmount()
  const next = setup()
  await waitFor(() => expect(next.result.current.loading).toBe(false))
  expect(next.result.current.draft).toEqual({ dados, campo: 'dpp' })
  expect(next.result.current.pending).toBe(true)
})

it('não reaproveita respostas ou conclusão de outra conta', async () => {
  storage.set('bb_anamnese_v1_7', JSON.stringify({ draft: { dados, campo: 'dpp' }, completed: true, extras: {} }))
  useApp.mockReturnValue({ currentUser: { id: 8 }, profile: {}, setProfile })
  const { result } = setup()
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.draft).toBeNull()
  expect(result.current.pending).toBe(true)
  expect(SecureStorage.getItem).toHaveBeenCalledWith('bb_anamnese_v1_8')
})

it('só remove a pendência após envio confirmado e atualiza o perfil sem perder outros dados', async () => {
  const { result } = setup()
  await waitFor(() => expect(result.current.loading).toBe(false))
  await act(async () => { await result.current.saveDraft(dados, 'aceitouTermos') })
  salvarAnamnese.mockRejectedValueOnce(new Error('Sem conexão'))
  await act(async () => { await expect(result.current.submit(dados)).rejects.toThrow('Sem conexão') })
  expect(result.current.pending).toBe(true)
  expect(result.current.draft.dados).toEqual(dados)
  await act(async () => { await result.current.submit(dados) })
  expect(result.current.pending).toBe(false)
  expect(result.current.draft).toBeNull()
  expect(result.current.extras.autorizaUsoDados).toBe('Não')
  expect(setProfile).toHaveBeenCalledWith(expect.objectContaining({ doctor: 'Dra. Ana', weeks: '24', blood: 'O+' }))
  expect(JSON.parse(storage.get('bb_anamnese_v1_7')).completed).toBe(true)
})

it('reconhece o preenchimento já realizado pelo Web', async () => {
  obterAnamnese.mockResolvedValue(remote)
  const { result } = setup()
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.pending).toBe(false)
  expect(result.current.questionario.id).toBe(20)
})

it('uma falha na consulta preserva a última conclusão conhecida', async () => {
  storage.set('bb_anamnese_v1_7', JSON.stringify({ completed: true }))
  obterAnamnese.mockRejectedValue(new Error('Offline'))
  const { result } = setup()
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.pending).toBe(false)
  expect(result.current.error).toContain('Não foi possível consultar')
})

it('um retorno antigo da consulta não reabre a pendência depois do envio', async () => {
  const { result } = setup()
  await waitFor(() => expect(result.current.loading).toBe(false))
  let resolveRefresh
  obterAnamnese.mockImplementationOnce(() => new Promise(resolve => { resolveRefresh = resolve }))
  act(() => { result.current.refresh() })
  await act(async () => { await result.current.submit(dados) })
  await act(async () => { resolveRefresh({ gestante: null, questionario: null }) })
  expect(result.current.pending).toBe(false)
  expect(result.current.questionario.id).toBe(20)
})

it('avisa quando não consegue guardar o rascunho sem marcar como concluído', async () => {
  const { result } = setup()
  await waitFor(() => expect(result.current.loading).toBe(false))
  SecureStorage.setItem.mockRejectedValueOnce(new Error('Disco indisponível'))
  await act(async () => { expect(await result.current.saveDraft(dados, 'dpp')).toBe(false) })
  expect(result.current.pending).toBe(true)
  expect(result.current.storageError).toContain('Não foi possível guardar')
  expect(result.current.draft.dados).toEqual(dados)
})

it('cancela requisições da sessão e ignora respostas depois de sair da conta', async () => {
  let finish
  obterAnamnese.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const view = setup()
  await waitFor(() => expect(obterAnamnese).toHaveBeenCalled())
  const signal = obterAnamnese.mock.calls[0][1].signal
  view.unmount()
  expect(signal.aborted).toBe(true)
  await act(async () => { finish(remote) })
  expect(SecureStorage.setItem).not.toHaveBeenCalled()
  expect(setProfile).not.toHaveBeenCalled()
})
