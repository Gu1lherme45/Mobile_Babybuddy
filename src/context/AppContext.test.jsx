import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { AppProvider, useApp } from './AppContext'
import SecureStorage from '../infrastructure/storage/SecureStorage'
import { clearCredentials } from '../infrastructure/http/credentialsStore'
import {
  autenticarUsuario,
  cadastrarUsuario,
  obterUsuarioAtual,
  trocarSenha,
  excluirConta,
} from '../application/auth'
import { registrarCompromisso, removerCompromisso } from '../application/agenda'
import { notifyUnauthorized } from '../infrastructure/http/unauthorizedHandler'

jest.mock('../infrastructure/storage/SecureStorage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), deleteItem: jest.fn() },
}))
jest.mock('../infrastructure/http/credentialsStore', () => ({
  clearCredentials: jest.fn(),
}))
jest.mock('../application/auth')
jest.mock('../application/agenda')

const USUARIO = { id: 3, nome: 'Lorena', email: 'lorena@a.com' }

function setup() {
  SecureStorage.getItem.mockResolvedValue(null)
  SecureStorage.setItem.mockResolvedValue()
  SecureStorage.deleteItem.mockResolvedValue()
  return renderHook(() => useApp(), { wrapper: ({ children }) => <AppProvider>{children}</AppProvider> })
}

describe('AppContext — autenticação', () => {
  afterEach(() => jest.clearAllMocks())

  it('login: autentica, guarda a sessão no SecureStorage e expõe o usuário mapeado', async () => {
    autenticarUsuario.mockResolvedValue(USUARIO)
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))

    let ok
    await act(async () => { ok = await result.current.login('lorena@a.com', '123') })

    expect(ok).toBe(true)
    expect(autenticarUsuario).toHaveBeenCalledWith('lorena@a.com', '123')
    expect(SecureStorage.setItem).toHaveBeenCalledWith('bb_email', 'lorena@a.com')
    expect(SecureStorage.setItem).toHaveBeenCalledWith('bb_password', '123')
    expect(result.current.currentUser).toEqual(USUARIO)
  })

  it('login: credenciais inválidas não autenticam e expõem authError', async () => {
    autenticarUsuario.mockRejectedValue(new Error('Usuário ou senha inválidos'))
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))

    let ok
    await act(async () => { ok = await result.current.login('x@a.com', 'errada') })

    expect(ok).toBe(false)
    expect(result.current.currentUser).toBeNull()
    expect(result.current.authError).toBe('Usuário ou senha inválidos')
  })

  it('register: cadastra e encadeia login automático', async () => {
    cadastrarUsuario.mockResolvedValue()
    autenticarUsuario.mockResolvedValue(USUARIO)
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))

    let ok
    await act(async () => { ok = await result.current.register('Lorena', 'lorena@a.com', '123') })

    expect(ok).toBe(true)
    expect(cadastrarUsuario).toHaveBeenCalledWith('Lorena', 'lorena@a.com', '123')
    expect(autenticarUsuario).toHaveBeenCalledWith('lorena@a.com', '123')
    expect(result.current.currentUser).toEqual(USUARIO)
  })

  it('restauração de sessão no boot: credenciais salvas válidas autenticam sem exigir novo login', async () => {
    SecureStorage.getItem.mockImplementation((key) => {
      if (key === 'bb_email') return Promise.resolve('lorena@a.com')
      if (key === 'bb_password') return Promise.resolve('123')
      return Promise.resolve(null)
    })
    obterUsuarioAtual.mockResolvedValue(USUARIO)

    const { result } = renderHook(() => useApp(), { wrapper: ({ children }) => <AppProvider>{children}</AppProvider> })
    await waitFor(() => expect(result.current.authLoading).toBe(false))

    expect(obterUsuarioAtual).toHaveBeenCalledWith('lorena@a.com', '123')
    expect(result.current.currentUser).toEqual(USUARIO)
  })

  it('changePassword: troca a senha e atualiza o SecureStorage local', async () => {
    autenticarUsuario.mockResolvedValue(USUARIO)
    trocarSenha.mockResolvedValue()
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))
    await act(async () => { await result.current.login('lorena@a.com', '123') })

    await act(async () => { await result.current.changePassword('NovaSenha@123') })

    expect(trocarSenha).toHaveBeenCalledWith(USUARIO.id, USUARIO.email, 'NovaSenha@123')
    expect(SecureStorage.setItem).toHaveBeenCalledWith('bb_password', 'NovaSenha@123')
  })

  it('deleteCurrentAccount: exclui a conta e limpa a sessão local (logout)', async () => {
    autenticarUsuario.mockResolvedValue(USUARIO)
    excluirConta.mockResolvedValue()
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))
    await act(async () => { await result.current.login('lorena@a.com', '123') })

    await act(async () => { await result.current.deleteCurrentAccount() })

    expect(excluirConta).toHaveBeenCalledWith(USUARIO.id)
    expect(clearCredentials).toHaveBeenCalled()
    expect(result.current.currentUser).toBeNull()
  })

  it('logout: limpa sessão local e o credentialsStore', async () => {
    autenticarUsuario.mockResolvedValue(USUARIO)
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))
    await act(async () => { await result.current.login('lorena@a.com', '123') })

    await act(async () => { await result.current.logout() })

    expect(SecureStorage.deleteItem).toHaveBeenCalledWith('bb_email')
    expect(SecureStorage.deleteItem).toHaveBeenCalledWith('bb_password')
    expect(clearCredentials).toHaveBeenCalled()
    expect(result.current.currentUser).toBeNull()
  })

  it('401 numa chamada autenticada (sessão expirada em outro lugar) desloga automaticamente', async () => {
    autenticarUsuario.mockResolvedValue(USUARIO)
    const { result } = setup()
    await waitFor(() => expect(result.current.authLoading).toBe(false))
    await act(async () => { await result.current.login('lorena@a.com', '123') })
    expect(result.current.currentUser).toEqual(USUARIO)

    await act(async () => { notifyUnauthorized() })

    await waitFor(() => expect(result.current.currentUser).toBeNull())
    expect(clearCredentials).toHaveBeenCalled()
  })
})

describe('AppContext — Agenda (lembretes e eventos)', () => {
  afterEach(() => jest.clearAllMocks())

  async function setupLogado() {
    autenticarUsuario.mockResolvedValue(USUARIO)
    const view = setup()
    await waitFor(() => expect(view.result.current.authLoading).toBe(false))
    await act(async () => { await view.result.current.login('lorena@a.com', '123') })
    return view
  }

  it('addReminder: salva local imediatamente e sincroniza com o backend em segundo plano', async () => {
    registrarCompromisso.mockResolvedValue({ id: 99 })
    const { result } = await setupLogado()

    const reminder = { id: 'local-1', title: 'Tomar vitamina', date: '2026-06-15', time: '08:00', cat: 'Medicamento', color: '#EC407A', done: false }
    await act(async () => { result.current.addReminder(reminder) })

    expect(result.current.reminders[0]).toMatchObject({ id: 'local-1', title: 'Tomar vitamina' })
    expect(registrarCompromisso).toHaveBeenCalledWith(USUARIO.id, reminder, 'Medicamento')

    await waitFor(() => expect(result.current.reminders[0].remoteId).toBe(99))
  })

  it('addEvent: usa "Outro" como categoria padrão (tela não tem seletor)', async () => {
    registrarCompromisso.mockResolvedValue({ id: 50 })
    const { result } = await setupLogado()

    const event = { id: 'local-2', title: 'Consulta', date: '2026-06-20', time: '14:30', local: 'UBS Centro', notes: '' }
    await act(async () => { result.current.addEvent(event) })

    expect(registrarCompromisso).toHaveBeenCalledWith(USUARIO.id, event, 'Outro')
    await waitFor(() => expect(result.current.events[0].remoteId).toBe(50))
  })

  it('deleteReminder: remove local e, se já sincronizado, remove no backend pelo remoteId', async () => {
    const { result } = await setupLogado()
    await act(async () => {
      result.current.addReminder({ id: 'local-1', title: 'X', date: '', cat: 'Outro' })
    })
    // simula que já foi sincronizado antes
    await act(async () => {
      result.current.deleteReminder('local-1')
    })

    expect(result.current.reminders).toHaveLength(0)
    expect(removerCompromisso).toHaveBeenCalled()
  })

  it('deleteEvent: remove local e aciona a remoção remota', async () => {
    const { result } = await setupLogado()
    await act(async () => {
      result.current.addEvent({ id: 'local-2', title: 'Y', date: '' })
    })
    await act(async () => {
      result.current.deleteEvent('local-2')
    })

    expect(result.current.events).toHaveLength(0)
    expect(removerCompromisso).toHaveBeenCalled()
  })

  it('toggleReminder continua 100% local: não aciona nenhuma chamada de Agenda', async () => {
    const { result } = await setupLogado()
    await act(async () => {
      result.current.addReminder({ id: 'local-1', title: 'X', date: '', cat: 'Outro', done: false })
    })
    registrarCompromisso.mockClear()

    await act(async () => { result.current.toggleReminder('local-1') })

    expect(result.current.reminders[0].done).toBe(true)
    expect(registrarCompromisso).not.toHaveBeenCalled()
  })
})
