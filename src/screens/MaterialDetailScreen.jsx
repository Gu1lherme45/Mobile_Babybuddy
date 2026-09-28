import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../components/Icon'
import { obterMaterial } from '../application/material'
import ArticlePdf from '../components/ArticlePdf'
import { loadArticleFile, releaseArticleFile, saveArticleFile, shareArticleFile } from '../infrastructure/material/articleFile'

export default function MaterialDetailScreen({ route, navigation }) {
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [pdfError, setPdfError] = useState('')
  const [busy, setBusy] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setMaterial(null)
    setError('')
    obterMaterial(route.params.materialId).then(value => { if (active) setMaterial(value) }).catch(() => { if (active) setError('Este artigo não está disponível.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [route.params.materialId])

  useEffect(() => {
    let active = true
    let loadedFile
    setFile(null)
    setPdfError('')
    if (material?.pdfUrl) loadArticleFile(material).then(value => {
      loadedFile = value
      if (active) setFile(value)
      else releaseArticleFile(value)
    }).catch(() => { if (active) setPdfError('Não foi possível carregar o PDF. Verifique sua conexão e tente novamente.') })
    return () => { active = false; releaseArticleFile(loadedFile) }
  }, [material, retry])

  function notify(message) {
    if (Platform.OS === 'web') globalThis.alert(message)
    else Alert.alert('Artigo', message)
  }

  async function handleAction(action) {
    if (!file || busy) return
    setBusy(action)
    try {
      if (action === 'download') {
        if (await saveArticleFile(file, material)) notify('PDF salvo com sucesso.')
      } else await shareArticleFile(file, material)
    } catch (error) {
      if (error.name !== 'AbortError') notify(error.message || 'Não foi possível concluir a ação. Tente novamente.')
    } finally {
      setBusy('')
    }
  }

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#EC407A" /></SafeAreaView>

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Voltar aos artigos"><Icon name="back" color="#9B315F" size={20} /><Text style={styles.backText}>Artigos</Text></TouchableOpacity>
    {error || !material ? <View style={styles.state}><Icon name="warn" color="#EC407A" size={34} /><Text style={styles.title}>Artigo indisponível</Text><Text style={styles.description}>{error}</Text></View>
      : <>{material.coverUrl ? <Image source={{ uri: material.coverUrl }} style={styles.cover} resizeMode="cover" accessibilityLabel={`Capa de ${material.title}`} />
        : <LinearGradient colors={['#FFF0F6', '#F9D8E5']} style={[styles.cover, styles.placeholder]}><Icon name="file" color="#EC407A" size={46} /></LinearGradient>}
        <Text style={styles.category}>{material.category.toUpperCase()}</Text><Text style={styles.title}>{material.title}</Text>
        <View style={styles.meta}><Text style={styles.author}>Por {material.author}</Text>{material.publishedAt && <Text style={styles.date}>{formatDate(material.publishedAt)}</Text>}</View>
        <Text style={styles.description}>{material.description}</Text>
        {material.pdfUrl ? <>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, (!file || busy) && styles.disabled]} disabled={!file || !!busy} onPress={() => handleAction('download')} accessibilityRole="button"><Text style={styles.buttonText}>{busy === 'download' ? 'Salvando…' : 'Baixar PDF'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.shareButton, (!file || busy) && styles.disabled]} disabled={!file || !!busy} onPress={() => handleAction('share')} accessibilityRole="button"><Text style={styles.buttonText}>{busy === 'share' ? 'Compartilhando…' : 'Compartilhar no WhatsApp'}</Text></TouchableOpacity>
          </View>
          <Text style={styles.stateText}>Para enviar o PDF, selecione o WhatsApp no menu de compartilhamento.</Text>
          <View style={styles.reader}>{file ? <ArticlePdf file={file} /> : pdfError ? <View style={styles.notice}><Text style={styles.stateText} accessibilityRole="alert">{pdfError}</Text><TouchableOpacity style={styles.back} onPress={() => setRetry(value => value + 1)} accessibilityRole="button"><Text style={styles.backText}>Tentar novamente</Text></TouchableOpacity></View> : <View style={styles.notice}><ActivityIndicator color="#EC407A" /><Text style={styles.stateText}>Carregando artigo…</Text></View>}</View>
        </> : <View style={styles.notice}><Text style={styles.noticeTitle}>PDF ainda não publicado</Text><Text style={styles.stateText}>O artigo completo ficará disponível aqui quando o PDF for publicado.</Text></View>}</>}
  </ScrollView></SafeAreaView>
}

function formatDate(value) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value)) }

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
