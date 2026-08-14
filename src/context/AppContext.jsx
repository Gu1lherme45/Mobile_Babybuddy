import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SecureStorage from '../infrastructure/storage/SecureStorage'
import { clearCredentials } from '../infrastructure/http/credentialsStore'
import { setUnauthorizedHandler } from '../infrastructure/http/unauthorizedHandler'
import {
  autenticarUsuario,
  cadastrarUsuario,
  obterUsuarioAtual,
  trocarSenha as trocarSenhaUseCase,
  excluirConta as excluirContaUseCase,
} from '../application/auth'
import { registrarCompromisso, removerCompromisso } from '../application/agenda'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  // Dados locais (salvos por email do usuário)
  const [profile, setProfileRaw] = useState({ name: '', weeks: '', due: '', doctor: '', hospital: '', weight: '', height: '', blood: '', allergies: '' })
  const [reminders, setReminders] = useState([])
  const [events, setEvents] = useState([])
  const [remFilter, setRemFilter] = useState('Todos')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

  // Restaura sessão salva ao abrir o app
  useEffect(() => {
    async function restore() {
      try {
        const email = await SecureStorage.getItem('bb_email')
        const password = await SecureStorage.getItem('bb_password')
        if (email && password) {
          const usuario = await obterUsuarioAtual(email, password)
          setCurrentUser(usuario)
          setCredentials({ email, password })
          await loadUserData(usuario)
        }
      } catch (_) {}
      setAuthLoading(false)
    }
    restore()
  }, [])

  // Sessão expirada/senha trocada em outro dispositivo/conta excluída: qualquer
  // chamada autenticada que volte 401 desloga automaticamente (ver apiClient).
  useEffect(() => {
    setUnauthorizedHandler(() => logout())
    return () => setUnauthorizedHandler(null)
  }, [])

  async function loadUserData(usuario) {
    try {
      const keys = ['profile', 'reminders', 'events', 'remFilter', 'calMonth', 'calYear']
      const pairs = await AsyncStorage.multiGet(keys.map(k => `${usuario.email}_${k}`))
      const data = Object.fromEntries(pairs.map(([k, v]) => [k.replace(`${usuario.email}_`, ''), v ? JSON.parse(v) : null]))
      if (data.profile) setProfileRaw(data.profile)
      if (data.reminders) setReminders(data.reminders)
      if (data.events) setEvents(data.events)
      if (data.remFilter) setRemFilter(data.remFilter)
      if (data.calMonth !== null && data.calMonth !== undefined) setCalMonth(data.calMonth)
      if (data.calYear) setCalYear(data.calYear)
      // Autocura: itens locais criados antes de existir sincronização (ou offline
      // na hora) ainda não têm remoteId — tenta persistir agora, sem bloquear o boot.
      ;(data.reminders || []).filter(r => !r.remoteId).forEach(r => syncLembreteComBackend(usuario.id, r))
      ;(data.events || []).filter(e => !e.remoteId).forEach(e => syncEventoComBackend(usuario.id, e))
    } catch (_) {}
  }

  async function saveItem(key, value) {
    if (!currentUser?.email) return
    await AsyncStorage.setItem(`${currentUser.email}_${key}`, JSON.stringify(value))
  }

  function syncLembreteComBackend(usuarioId, reminder) {
    registrarCompromisso(usuarioId, reminder, reminder.cat)
      .then(compromisso => {
        if (!compromisso) return
        setReminders(prev => {
          const next = prev.map(item => item.id === reminder.id ? { ...item, remoteId: compromisso.id } : item)
          saveItem('reminders', next)
          return next
        })
      })
      .catch(() => {})
  }

  function syncEventoComBackend(usuarioId, event) {
    // AddEventScreen não tem seletor de categoria — usa "Outro" como tipo padrão no backend.
    registrarCompromisso(usuarioId, event, 'Outro')
      .then(compromisso => {
        if (!compromisso) return
        setEvents(prev => {
          const next = prev.map(item => item.id === event.id ? { ...item, remoteId: compromisso.id } : item)
          saveItem('events', next)
          return next
        })
      })
      .catch(() => {})
  }

  async function login(email, password) {
    setAuthLoading(true)
    setAuthError('')
    try {
      const usuario = await autenticarUsuario(email, password)
      await SecureStorage.setItem('bb_email', email)
      await SecureStorage.setItem('bb_password', password)
      setCurrentUser(usuario)
      setCredentials({ email, password })
      await loadUserData(usuario)
      return true
    } catch (err) {
      setAuthError(err.message || 'Usuário ou senha inválidos')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  async function register(nome, email, password) {
    setAuthLoading(true)
    setAuthError('')
    try {
      await cadastrarUsuario(nome, email, password)
      return await login(email, password)
    } catch (err) {
      setAuthError(err.message || 'Erro ao criar conta. Tente novamente.')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  async function logout() {
    await SecureStorage.deleteItem('bb_email').catch(() => {})
    await SecureStorage.deleteItem('bb_password').catch(() => {})
    clearCredentials()
    setCurrentUser(null)
    setCredentials(null)
    setProfileRaw({ name: '', weeks: '', due: '', doctor: '', hospital: '', weight: '', height: '', blood: '', allergies: '' })
    setReminders([])
    setEvents([])
    setRemFilter('Todos')
    setCalMonth(new Date().getMonth())
    setCalYear(new Date().getFullYear())
    setAuthError('')
  }

  async function deleteCurrentAccount() {
    await excluirContaUseCase(currentUser?.id)
    await logout()
  }

  async function changePassword(newPassword) {
    if (!currentUser?.id) throw new Error('Não autenticado')
    await trocarSenhaUseCase(currentUser.id, currentUser.email, newPassword)
    await SecureStorage.setItem('bb_password', newPassword)
    setCredentials(prev => ({ ...prev, password: newPassword }))
  }

  function setProfile(newProfile) {
    setProfileRaw(newProfile)
    saveItem('profile', newProfile)
  }

  function addReminder(r) {
    setReminders(prev => {
      const next = [r, ...prev]
      saveItem('reminders', next)
      return next
    })
    if (currentUser?.id) syncLembreteComBackend(currentUser.id, r)
  }
  function deleteReminder(id) {
    setReminders(prev => {
      const removido = prev.find(r => r.id === id)
      const next = prev.filter(r => r.id !== id)
      saveItem('reminders', next)
      removerCompromisso(removido?.remoteId)
      return next
    })
  }
  function toggleReminder(id) {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, done: !r.done } : r)
      saveItem('reminders', next)
      return next
    })
  }

  function addEvent(e) {
    setEvents(prev => {
      const next = [e, ...prev]
      saveItem('events', next)
      return next
    })
    if (currentUser?.id) syncEventoComBackend(currentUser.id, e)
  }
  function deleteEvent(id) {
    setEvents(prev => {
      const removido = prev.find(e => e.id === id)
      const next = prev.filter(e => e.id !== id)
      saveItem('events', next)
      removerCompromisso(removido?.remoteId)
      return next
    })
  }

  function updateCalMonth(m) { setCalMonth(m); saveItem('calMonth', m) }
  function updateCalYear(y) { setCalYear(y); saveItem('calYear', y) }
  function updateRemFilter(f) { setRemFilter(f); saveItem('remFilter', f) }

  return (
    <AppContext.Provider value={{
      currentUser, credentials, authLoading, authError, setAuthError,
      login, register, logout, deleteCurrentAccount, changePassword,
      profile, setProfile,
      reminders, addReminder, deleteReminder, toggleReminder,
      events, addEvent, deleteEvent,
      calMonth, setCalMonth: updateCalMonth,
      calYear, setCalYear: updateCalYear,
      remFilter, setRemFilter: updateRemFilter,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
