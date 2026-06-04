import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

export default function AddEventScreen({ navigation }) {
  const { addEvent } = useApp()
  const [title, setTitle]   = useState('')
  const [date, setDate]     = useState('')
  const [time, setTime]     = useState('')
  const [local, setLocal]   = useState('')
  const [notes, setNotes]   = useState('')
  const [titleErr, setTitleErr] = useState('')

  function handleSave() {
    if (!title.trim()) { setTitleErr('Título obrigatório'); return }
    addEvent({
      id: Date.now().toString(),
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      local: local.trim(),
      notes: notes.trim(),
    })
    navigation.goBack()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="back" color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Evento</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>TÍTULO *</Text>
          <TextInput
            style={[styles.input, titleErr ? styles.inputErr : null]}
            placeholder="Ex: Consulta pré-natal"
            placeholderTextColor="#C9A8B5"
            value={title}
            onChangeText={v => { setTitle(v); setTitleErr('') }}
          />
          {!!titleErr && <Text style={styles.errText}>{titleErr}</Text>}

          <Text style={styles.label}>DATA (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2026-06-20"
            placeholderTextColor="#C9A8B5"
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>HORÁRIO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 14:30"
            placeholderTextColor="#C9A8B5"
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>LOCAL</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: UBS Centro"
            placeholderTextColor="#C9A8B5"
            value={local}
            onChangeText={setLocal}
          />

          <Text style={styles.label}>OBSERVAÇÕES</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Notas adicionais..."
            placeholderTextColor="#C9A8B5"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Icon name="check" color="#fff" size={18} />
            <Text style={styles.saveBtnText}>Salvar Evento</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  body: { padding: 20, gap: 8, paddingBottom: 40 },
  label: { fontSize: 10, fontWeight: '900', color: '#A07080', letterSpacing: 1, marginTop: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#F5DAE4',
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 13,
    fontSize: 13, color: '#2D1220', fontWeight: '600',
  },
  inputErr: { borderColor: '#E53935' },
  errText: { fontSize: 11, color: '#E53935', fontWeight: '700', paddingLeft: 6 },
  textarea: { borderRadius: 16, height: 90, paddingTop: 13 },
  saveBtn: {
    backgroundColor: '#EC407A', borderRadius: 50,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
})
