import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { API_URL } from '../config'

// Wrapper: no browser usa localStorage, no celular usa SecureStore
const SecureStorage = {
  async getItem(key) {
    if (Platform.OS === 'web') return localStorage.getItem(key)
    return await SecureStorage.getItem(key)
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return }
    await SecureStorage.setItem(key, value)
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return }
    await SecureStorage.deleteItem(key)
  },
}

const AppContext = createContext(null)

function basicAuth(email, password) {
  const encoded = btoa(`${email}:${password}`)
  return `Basic ${encoded}`
}

async function apiFetch(path, options = {}, credentials = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (credentials) {
    headers['Authorization'] = basicAuth(credentials.email, credentials.password)
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  return response
}

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

  // Restaura credenciais salvas ao abrir o app
  useEffect(() => {
    async function restore() {
      try {
        const email = await SecureStorage.getItem('bb_email')
        const password = await SecureStorage.getItem('bb_password')
        if (email && password) {
          const creds = { email, password }
          const r = await apiFetch('/api/usuarios/me', {}, creds)
          if (r.ok) {
            const me = await r.json()
            setCurrentUser({ id: me.id, nome: me.nome, email: me.username })
            setCredentials(creds)
            await loadUserData(me.username)
          }
        }
      } catch (_) {}
      setAuthLoading(false)
    }
    restore()
  }, [])

  async function loadUserData(email) {
    try {
      const keys = ['profile', 'reminders', 'events', 'remFilter', 'calMonth', 'calYear']
      const pairs = await AsyncStorage.multiGet(keys.map(k => `${email}_${k}`))
      const data = Object.fromEntries(pairs.map(([k, v]) => [k.replace(`${email}_`, ''), v ? JSON.parse(v) : null]))
      if (data.profile) setProfileRaw(data.profile)
      if (data.reminders) setReminders(data.reminders)
      if (data.events) setEvents(data.events)
      if (data.remFilter) setRemFilter(data.remFilter)
      if (data.calMonth !== null && data.calMonth !== undefined) setCalMonth(data.calMonth)
      if (data.calYear) setCalYear(data.calYear)
    } catch (_) {}
  }

  async function saveItem(key, value) {
    if (!currentUser?.email) return
    await AsyncStorage.setItem(`${currentUser.email}_${key}`, JSON.stringify(value))
  }

  async function login(email, password) {
    setAuthLoading(true)
    setAuthError('')
    try {
      const creds = { email, password }
      const r = await apiFetch('/api/usuarios/me', {}, creds)
      if (!r.ok) throw new Error('Usuário ou senha inválidos')
      const me = await r.json()
      await SecureStorage.setItem('bb_email', email)
      await SecureStorage.setItem('bb_password', password)
      setCurrentUser({ id: me.id, nome: me.nome, email: me.username })
      setCredentials(creds)
      await loadUserData(me.username)
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
      const r = await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, username: email, password, nivelAcesso: 'Gestante' }),
      })
      if (!r.ok) {
        const msg = await r.text().catch(() => '')
        throw new Error(msg || 'Erro ao cadastrar')
      }
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
    if (currentUser?.id) {
      await apiFetch(`/api/usuarios/${currentUser.id}`, { method: 'DELETE' }, credentials).catch(() => {})
    }
    await logout()
  }

  async function changePassword(newPassword) {
    if (!currentUser?.id) throw new Error('Não autenticado')
    const r = await apiFetch(`/api/usuarios/${currentUser.id}/senha`, {
      method: 'PATCH',
      body: JSON.stringify({ senha: newPassword }),
    }, credentials)
    if (!r.ok) throw new Error('Erro ao trocar senha')
    // Update stored password
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
  }
  function deleteReminder(id) {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id)
      saveItem('reminders', next)
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
  }
  function deleteEvent(id) {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id)
      saveItem('events', next)
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
