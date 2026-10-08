import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { File } from 'expo-file-system'
import { useApp } from '../context/AppContext'
import { cadastrarMaterial, criarCategoriaMaterial, listarCategoriasMaterial } from '../application/material'
import { copyPickedArticleToCache } from '../infrastructure/material/articleUploadFile'

const MAX_PDF_BYTES = 25 * 1024 * 1024
const MAX_TEXT_BYTES = 5 * 1024 * 1024

function notify(message) {
  if (Platform.OS === 'web') globalThis.alert(message)
  else Alert.alert('Artigos', message)
}

export default function MaterialCreateScreen({ navigation }) {
  const { currentUser } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [author, setAuthor] = useState(currentUser?.nome || 'BabyBuddy')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadCategories = async () => {
    setCategoriesLoading(true)
    setCategoriesError('')
    try { setCategories(await listarCategoriasMaterial()) }
    catch (_) { setCategoriesError('Não foi possível carregar as categorias.') }
    finally { setCategoriesLoading(false) }
  }

  useEffect(() => { loadCategories() }, [])

  const addCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const created = await criarCategoriaMaterial(newCategory)
      setCategories(current => [...new Set([...current, created])].sort((a, b) => a.localeCompare(b, 'pt-BR')))
      setCategory(created)
      setNewCategory('')
      setAddingCategory(false)
      setCategoryOpen(false)
    } catch (error) {
      notify(error.response?.data?.message || error.message || 'Não foi possível criar a categoria.')
    }
  }

  const chooseFile = async () => {
    try {
      const result = await File.pickFileAsync({ mimeTypes: ['application/pdf', 'text/html', 'text/markdown'] })
      if (result.canceled) return
      const picked = result.result
      if (!picked) throw new Error('O seletor não retornou um arquivo. Tente selecioná-lo novamente.')
      const isPdf = /\.pdf$/i.test(picked.name || '')
      if (picked.size > (isPdf ? MAX_PDF_BYTES : MAX_TEXT_BYTES)) {
        notify(isPdf ? 'O PDF deve ter no máximo 25 MB.' : 'O arquivo de texto deve ter no máximo 5 MB.')
        return
      }
      const name = picked.name || 'artigo'
      if (!/\.(pdf|html?|md|markdown)$/i.test(name)) {
        throw new Error('O arquivo deve ser PDF, HTML ou Markdown.')
      }
      const extensionMime = isPdf ? 'application/pdf' : /\.html?$/i.test(name) ? 'text/html' : 'text/markdown'
      const mimeType = picked.type && picked.type !== 'application/octet-stream' ? picked.type : extensionMime
      if (mimeType !== extensionMime) throw new Error('O tipo MIME do arquivo não corresponde à extensão informada.')
      const cachedFile = await copyPickedArticleToCache(picked)
      setFile({ ...cachedFile, mimeType })
    } catch (error) {
      notify(error.message || 'Não foi possível selecionar ou preparar o arquivo.')
    }
  }

  const submit = async () => {
    setSaving(true)
    try {
      await cadastrarMaterial({ title, description, category, author, content, file })
      notify('Artigo publicado com sucesso.')
      navigation.goBack()
    } catch (error) {
      const networkFailure = /network|timeout|connection|conexão/i.test(error.message || '')
      notify(networkFailure
        ? 'Falha de rede durante o envio. Verifique sua conexão e tente novamente.'
        : error.message || 'Não foi possível publicar o artigo.')
    } finally {
      setSaving(false)
    }
  }

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button"><Text style={styles.back}>‹  Artigos</Text></TouchableOpacity>
      <Text style={styles.title}>Cadastrar artigo</Text>
      <Text style={styles.subtitle}>Preencha as informações e escreva o conteúdo ou envie um arquivo.</Text>
      <Text style={styles.label}>Título *</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Ex.: Guia de pré-natal" maxLength={150} />
      <Text style={styles.label}>Categoria *</Text>
      <View style={styles.categoryRow}>
        <TouchableOpacity style={[styles.input, styles.categorySelect]} onPress={() => setCategoryOpen(value => !value)} accessibilityRole="button" accessibilityLabel="Selecionar categoria">
          <Text style={category ? styles.selectedCategory : styles.categoryPlaceholder}>{category || (categoriesLoading ? 'Carregando categorias…' : 'Selecione uma categoria')}</Text>
          <Text style={styles.chevron}>{categoryOpen ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCategoryButton} onPress={() => setAddingCategory(value => !value)} accessibilityRole="button" accessibilityLabel="Adicionar categoria"><Text style={styles.addCategoryText}>+</Text></TouchableOpacity>
      </View>
      {categoriesError ? <TouchableOpacity onPress={loadCategories}><Text style={styles.inlineError}>{categoriesError} Toque para tentar novamente.</Text></TouchableOpacity> : null}
      {categoryOpen && categories.length > 0 ? <View style={styles.categoryOptions}>{categories.map(item => <TouchableOpacity key={item} style={styles.categoryOption} onPress={() => { setCategory(item); setCategoryOpen(false) }} accessibilityRole="button"><Text style={styles.categoryOptionText}>{item}</Text></TouchableOpacity>)}</View> : null}
      {categoryOpen && !categoriesLoading && !categoriesError && categories.length === 0 ? <Text style={styles.helper}>Nenhuma categoria cadastrada ainda.</Text> : null}
      {addingCategory ? <View style={styles.newCategoryRow}><TextInput value={newCategory} onChangeText={setNewCategory} style={[styles.input, styles.newCategoryInput]} placeholder="Nova categoria" maxLength={100} returnKeyType="done" onSubmitEditing={addCategory} /><TouchableOpacity style={styles.addCategorySubmit} onPress={addCategory} accessibilityRole="button"><Text style={styles.addCategorySubmitText}>Adicionar</Text></TouchableOpacity></View> : null}
      <Text style={styles.label}>Autor *</Text>
      <TextInput value={author} onChangeText={setAuthor} style={styles.input} placeholder="BabyBuddy" maxLength={200} />
      <Text style={styles.label}>Descrição</Text>
      <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.description]} placeholder="Resumo do artigo" multiline maxLength={500} />

      <View style={styles.divider}><View style={styles.rule} /><Text style={styles.or}>OU</Text><View style={styles.rule} /></View>
      <Text style={styles.label}>Conteúdo do artigo</Text>
      <TextInput value={content} onChangeText={setContent} style={[styles.input, styles.body]} placeholder="Escreva o artigo aqui. A formatação Markdown é aceita." multiline textAlignVertical="top" />
      <TouchableOpacity style={styles.fileButton} onPress={chooseFile} accessibilityRole="button"><Text style={styles.fileButtonText}>{file ? 'Trocar arquivo' : 'Selecionar PDF, HTML ou Markdown'}</Text></TouchableOpacity>
      {file ? <Text style={styles.fileName}>{file.name}</Text> : null}
      <TouchableOpacity style={[styles.submit, saving && styles.disabled]} onPress={submit} disabled={saving} accessibilityRole="button">
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Publicar artigo</Text>}
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8FA' }, content: { padding: 20, paddingBottom: 40 },
  back: { color: '#9B315F', fontSize: 16, fontWeight: '700', marginBottom: 20 }, title: { color: '#2D1220', fontSize: 26, fontWeight: '900' },
  subtitle: { color: '#7D5A69', fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 20 }, label: { color: '#4E2637', fontSize: 13, fontWeight: '800', marginBottom: 7, marginTop: 12 },
  input: { backgroundColor: '#fff', borderColor: '#EAD5DE', borderWidth: 1, borderRadius: 12, padding: 13, color: '#2D1220', fontSize: 15 }, description: { minHeight: 80, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', gap: 9 }, categorySelect: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectedCategory: { color: '#2D1220', fontSize: 15 }, categoryPlaceholder: { color: '#A98291', fontSize: 15 }, chevron: { color: '#9B315F', fontSize: 17, fontWeight: '900' },
  addCategoryButton: { width: 48, borderRadius: 12, backgroundColor: '#FCE8EF', alignItems: 'center', justifyContent: 'center' }, addCategoryText: { color: '#B62561', fontSize: 26, fontWeight: '500', lineHeight: 30 }, categoryOptions: { backgroundColor: '#fff', borderColor: '#EAD5DE', borderWidth: 1, borderRadius: 12, marginTop: 6, overflow: 'hidden' }, categoryOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5E8ED' }, categoryOptionText: { color: '#4E2637', fontSize: 14 },
  newCategoryRow: { flexDirection: 'row', gap: 8, marginTop: 8 }, newCategoryInput: { flex: 1 }, addCategorySubmit: { paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#FCE8EF', justifyContent: 'center' }, addCategorySubmitText: { color: '#B62561', fontSize: 13, fontWeight: '900' }, inlineError: { color: '#B42318', fontSize: 12, marginTop: 7 }, helper: { color: '#8A6575', fontSize: 12, marginTop: 6 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 }, rule: { flex: 1, height: 1, backgroundColor: '#EAD5DE' }, or: { color: '#A07080', fontSize: 11, fontWeight: '800' },
  body: { minHeight: 220, textAlignVertical: 'top', lineHeight: 21 }, fileButton: { borderWidth: 1, borderColor: '#EC407A', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  fileButtonText: { color: '#C0255B', fontSize: 14, fontWeight: '800' }, fileName: { color: '#7D5A69', fontSize: 12, marginTop: 7 },
  submit: { backgroundColor: '#C0255B', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 22 }, submitText: { color: '#fff', fontSize: 15, fontWeight: '900' }, disabled: { opacity: 0.6 },
})
