import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../components/Icon'
import { obterMaterial } from '../application/material'
import ArticlePdf from '../components/ArticlePdf'
import ArticleHtml from '../components/ArticleHtml'
import { loadArticleHtml } from '../components/articleDocument'
import { saveArticleFile, shareArticleFile } from '../infrastructure/material/articleFile'
import { createArticleFileSession } from '../infrastructure/material/articleFileSession'
import { getCredentials } from '../infrastructure/http/credentialsStore'

export default function MaterialDetailScreen({ route, navigation }) {
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [pdfError, setPdfError] = useState('')
  const [busy, setBusy] = useState('')
  const [retry, setRetry] = useState(0)
  const [html, setHtml] = useState('')
  const [prepared, setPrepared] = useState(false)
  const sessionRef = useRef(null)
  const actionRef = useRef(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setMaterial(null)
    setError('')
    obterMaterial(route.params.materialId).then(value => { if (active) setMaterial(value) }).catch(() => { if (active) setError('Este artigo não está disponível.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [route.params.materialId, retry])

  useEffect(() => {
    let active = true
    const abort = new AbortController()
    const session = material?.pdfUrl ? createArticleFileSession({
      ...material,
      downloadHeaders: authHeaders(),
    }) : null
    sessionRef.current = session
    setFile(null)
    setHtml('')
    setPrepared(false)
    setPdfError('')
    if (material?.contentUrl) {
      const isPdf = material.contentType === 'application/pdf'
      const task = isPdf && session ? session.get() : loadArticleHtml(material.contentUrl, abort.signal)
      task.then(value => {
        if (!active) return
        if (isPdf) { setFile(value); setPrepared(true) }
        else setHtml(value)
      }).catch(() => { if (active) setPdfError('Não foi possível carregar o artigo. Verifique sua conexão e tente novamente.') })
    }
    return () => { active = false; abort.abort(); session?.dispose(); if (sessionRef.current === session) sessionRef.current = null }
  }, [material])

  function notify(message) {
    if (Platform.OS === 'web') globalThis.alert(message)
    else Alert.alert('Artigo', message)
  }

  async function handleAction(action) {
    const session = sessionRef.current
    if (!session || actionRef.current) return
    actionRef.current = true
    setBusy(action)
    try {
      await session.use(async pdf => {
        if (sessionRef.current !== session) return
        setPrepared(true)
        // Web Share needs a fresh user gesture after an asynchronous download.
        if (action === 'share' && Platform.OS === 'web' && !prepared) {
          notify('PDF preparado. Toque novamente em Compartilhar no WhatsApp.')
          return
        }
        if (action === 'download') {
          if (await saveArticleFile(pdf, material)) notify(Platform.OS === 'web' ? 'Download do PDF iniciado.' : 'PDF salvo com sucesso.')
        } else await shareArticleFile(pdf, material)
      })
    } catch (error) {
      if (sessionRef.current === session && error.name !== 'AbortError') notify(error.message || 'Não foi possível concluir a ação. Tente novamente.')
    } finally {
      actionRef.current = false
      setBusy('')
    }
  }

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#EC407A" /></SafeAreaView>

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Voltar aos artigos"><Icon name="back" color="#9B315F" size={20} /><Text style={styles.backText}>Artigos</Text></TouchableOpacity>
    {error || !material ? <View style={styles.state}><Icon name="warn" color="#EC407A" size={34} /><Text style={styles.title}>Artigo indisponível</Text><Text style={styles.description}>{error}</Text><TouchableOpacity onPress={() => setRetry(value => value + 1)} accessibilityRole="button"><Text style={styles.backText}>Tentar novamente</Text></TouchableOpacity></View>
      : <>{material.coverUrl ? <Image source={{ uri: material.coverUrl }} style={styles.cover} resizeMode="cover" accessibilityLabel={`Capa de ${material.title}`} />
        : <LinearGradient colors={['#FFF0F6', '#F9D8E5']} style={[styles.cover, styles.placeholder]}><Icon name="file" color="#EC407A" size={46} /></LinearGradient>}
        <Text style={styles.category}>{material.category.toUpperCase()}</Text><Text style={styles.title}>{material.title}</Text>
        <View style={styles.meta}><Text style={styles.author}>Por {material.author}</Text>{material.publishedAt && <Text style={styles.date}>{formatDate(material.publishedAt)}</Text>}</View>
        <Text style={styles.description}>{material.description}</Text>
        {material.pdfUrl ? <>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, busy && styles.disabled]} disabled={!!busy} onPress={() => handleAction('download')} accessibilityRole="button"><Text style={styles.buttonText}>{busy === 'download' ? 'Preparando PDF…' : 'Baixar PDF'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.shareButton, busy && styles.disabled]} disabled={!!busy} onPress={() => handleAction('share')} accessibilityRole="button"><Text style={styles.buttonText}>{busy === 'share' ? 'Preparando compartilhamento…' : 'Compartilhar no WhatsApp'}</Text></TouchableOpacity>
          </View>
          <Text style={styles.stateText}>Para enviar o PDF, selecione o WhatsApp no menu de compartilhamento.</Text>
        </> : <View style={styles.notice}><Text style={styles.noticeTitle}>PDF ainda não publicado</Text><Text style={styles.stateText}>O download ficará disponível quando o PDF for publicado.</Text></View>}
        <View style={styles.reader}>{pdfError ? <View style={styles.notice}><Text style={styles.stateText} accessibilityRole="alert">{pdfError}</Text><TouchableOpacity style={styles.back} onPress={() => setRetry(value => value + 1)} accessibilityRole="button"><Text style={styles.backText}>Tentar novamente</Text></TouchableOpacity></View>
          : html ? <ArticleHtml html={html} onError={() => setPdfError('Não foi possível exibir o artigo. Tente novamente.')} />
          : file ? <ArticlePdf file={file} />
          : material.contentUrl ? <View style={styles.notice}><ActivityIndicator color="#EC407A" /><Text style={styles.stateText}>Carregando artigo…</Text></View>
          : <Text style={styles.stateText}>Conteúdo ainda não publicado.</Text>}</View></>}
  </ScrollView></SafeAreaView>
}

function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date) }

function authHeaders() {
  const credentials = getCredentials()
  if (!credentials) return {}
  const bytes = new TextEncoder().encode(`${credentials.username}:${credentials.password}`)
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
  return { Authorization: `Basic ${globalThis.btoa(binary)}` }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F8' }, content: { padding: 18, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 12 }, backText: { color: '#9B315F', fontSize: 13, fontWeight: '800' },
  cover: { width: '100%', height: 190, borderRadius: 26, backgroundColor: '#FFF5F8' }, placeholder: { alignItems: 'center', justifyContent: 'center' },
  actions: { gap: 10, marginVertical: 16 }, shareButton: { backgroundColor: '#237D50', marginTop: 0 }, disabled: { opacity: 0.5 }, reader: { marginTop: 18, minHeight: 140 },
  category: { color: '#EC407A', fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 22 }, title: { color: '#2D1220', fontSize: 29, lineHeight: 34, fontWeight: '900', marginTop: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }, author: { color: '#8F6476', fontSize: 12, fontWeight: '800' }, date: { color: '#A98291', fontSize: 12 },
  description: { color: '#654A56', fontSize: 15, lineHeight: 23, marginTop: 18 }, button: { backgroundColor: '#EC407A', borderRadius: 17, paddingHorizontal: 18, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 26 },
  buttonText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center' }, notice: { padding: 18, borderRadius: 17, backgroundColor: '#FFF5F8', marginTop: 24 },
  noticeTitle: { color: '#7F3154', fontSize: 14, fontWeight: '900', marginBottom: 5 }, stateText: { color: '#8A6575', fontSize: 12, lineHeight: 18 }, state: { alignItems: 'center', paddingVertical: 80 },
})
