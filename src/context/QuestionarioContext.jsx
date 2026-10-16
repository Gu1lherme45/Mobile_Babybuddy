import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useApp } from './AppContext'
import SecureStorage from '../infrastructure/storage/SecureStorage'
import { obterAnamnese, salvarAnamnese } from '../application/questionario'
import { respostasLocais } from '../domain/questionario/Questionario'

const QuestionarioContext = createContext(null)
const LOCAL_INICIAL = { draft: null, completed: false, extras: {} }

export function QuestionarioProvider({ children }) {
  const { currentUser, setProfile, profile } = useApp()
  const [local, setLocal] = useState(LOCAL_INICIAL)
  const [remote, setRemote] = useState({ gestante: null, questionario: null })
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [saving, setSaving] = useState(false)
  const localRef = useRef(LOCAL_INICIAL)
  const mounted = useRef(true)
  const queue = useRef(Promise.resolve())
  const request = useRef(null)
  const version = useRef(0)
  const savingRef = useRef(false)
  const sessionAbort = useRef(null)
  if (!sessionAbort.current) sessionAbort.current = new AbortController()
  const storageKey = `bb_anamnese_v1_${currentUser?.id}`

  // O provider é remontado por conta em App.js. Nenhum retorno de uma sessão
  // anterior pode atualizar as respostas ou o perfil da próxima usuária.
  useEffect(() => {
    mounted.current = true
    if (sessionAbort.current.signal.aborted) sessionAbort.current = new AbortController()
    return () => { mounted.current = false; sessionAbort.current.abort() }
  }, [])

  const persist = useCallback(next => {
    localRef.current = next
    if (mounted.current) setLocal(next)
    queue.current = queue.current.catch(() => {}).then(() => SecureStorage.setItem(storageKey, JSON.stringify(next)))
    return queue.current.then(() => {
      if (mounted.current) setStorageError('')
      return true
    }).catch(() => {
      if (mounted.current) setStorageError('Não foi possível guardar o progresso neste aparelho. Mantenha o aplicativo aberto e tente novamente.')
      return false
    })
  }, [storageKey])

  const refresh = useCallback(() => {
    if (!currentUser?.id || savingRef.current) return Promise.resolve()
    if (request.current) return request.current
    const currentVersion = version.current
    setLoading(true)
    const pending = obterAnamnese(currentUser.id, { signal: sessionAbort.current.signal }).then(result => {
      if (!mounted.current || currentVersion !== version.current) return
      setRemote(result)
      setError('')
      return persist({ ...localRef.current, completed: result.questionario?.aceiteTermos === true })
    }).catch(() => {
      if (mounted.current && currentVersion === version.current) setError('Não foi possível consultar seu questionário. Verifique a conexão e tente novamente.')
    }).finally(() => {
      if (mounted.current && currentVersion === version.current) setLoading(false)
      if (request.current === pending) request.current = null
    })
    request.current = pending
    return pending
  }, [currentUser?.id, persist])

  useEffect(() => {
    let active = true
    async function load() {
      if (!currentUser?.id) { setLoading(false); setReady(true); return }
      try {
        const value = await SecureStorage.getItem(storageKey)
        const stored = value ? JSON.parse(value) : null
        if (!active) return
        if (stored && typeof stored === 'object') {
          const next = { ...LOCAL_INICIAL, ...stored }
          localRef.current = next
          setLocal(next)
        }
      } catch (_) {
        if (active) setStorageError('Não foi possível recuperar o progresso salvo neste aparelho.')
      }
      if (!active) return
      setReady(true)
      await refresh()
    }
    load()
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && active) refresh()
    })
    return () => { active = false; subscription.remove() }
  }, [currentUser?.id, storageKey, refresh])

  const saveDraft = useCallback((dados, campo) => persist({ ...localRef.current, draft: { dados, campo } }), [persist])

  async function submit(dados) {
    if (savingRef.current) return false
    savingRef.current = true
    version.current += 1
    setSaving(true)
    try {
      const result = await salvarAnamnese(currentUser.id, dados, { signal: sessionAbort.current.signal })
      if (!mounted.current) return false
      setRemote(result)
      setError('')
      await persist({ completed: true, draft: null, extras: respostasLocais(dados) })
      if (!mounted.current) return false
      setProfile({
        ...profile, birthDate: dados.dataNascimento, blood: dados.tipoSanguineo,
        weeks: dados.semanaGestacao, due: dados.dpp,
        allergies: dados.possuiAlergia === 'Sim' ? dados.alergia.trim() : '',
      })
      return true
    } finally {
      savingRef.current = false
      if (mounted.current) { setSaving(false); setLoading(false) }
    }
  }

  return (
    <QuestionarioContext.Provider value={{
      ...remote, draft: local.draft, extras: local.extras,
      pending: ready && !local.completed, completed: local.completed,
      loading, ready, error, storageError, saving, refresh, saveDraft, submit,
    }}>
      {children}
    </QuestionarioContext.Provider>
  )
}

export function useQuestionario() {
  return useContext(QuestionarioContext)
}
