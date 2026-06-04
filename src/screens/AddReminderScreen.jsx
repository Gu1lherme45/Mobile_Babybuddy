import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

const CATS = ['Medicamento', 'Consulta', 'Exame', 'Outro']
const COLORS = ['#EC407A', '#FF6FAD', '#FF8C00', '#27AE60', '#1565C0', '#7B1FA2']

export default function AddReminderScreen({ navigation }) {
  const { addReminder } = useApp()
  const [title, setTitle] = useState('')
  const [time, setTime]   = useState('')
  const [date, setDate]   = useState('')
  const [cat, setCat]     = useState('Consulta')
  const [color, setColor] = useState('#EC407A')
  const [titleErr, setTitleErr] = useState('')

  function handleSave() {
    if (!title.trim()) { setTitleErr('Título obrigatório'); return }
    addReminder({
      id: Date.now().toString(),
      title: title.trim(),
      time: time.trim(),
      date: date.trim(),
      cat,
      color,
      done: false,
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
          <Text style={styles.headerTitle}>Novo Lembrete</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>TÍTULO *</Text>
          <TextInput
            style={[styles.input, titleErr ? styles.inputErr : null]}
            placeholder="Ex: Tomar vitamina"
            placeholderTextColor="#C9A8B5"
            value={title}
            onChangeText={v => { setTitle(v); setTitleErr('') }}
          />
          {!!titleErr && <Text style={styles.errText}>{titleErr}</Text>}

          <Text style={styles.label}>HORÁRIO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 08:00"
            placeholderTextColor="#C9A8B5"
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>DATA (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2026-06-15"
            placeholderTextColor="#C9A8B5"
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>CATEGORIA</Text>
          <View style={styles.chipsRow}>
            {CATS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, cat === c && styles.chipActive]}
                onPress={() => setCat(c)}
              >
                <Text style={[styles.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>COR</Text>
          <View style={styles.colorsRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSel]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Icon name="check" color="#fff" size={18} />
            <Text style={styles.saveBtnText}>Salvar Lembrete</Text>
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
    borderRadius: 50, paddingHorizontal: 18, paddingVertical: 13,
    fontSize: 13, color: '#2D1220', fontWeight: '600',
  },
  inputErr: { borderColor: '#E53935' },
  errText: { fontSize: 11, color: '#E53935', fontWeight: '700', paddingLeft: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 50, borderWidth: 1.5, borderColor: '#F5DAE4',
    paddingHorizontal: 14, paddingVertical: 7,
  },
  chipActive: { backgroundColor: '#EC407A', borderColor: '#EC407A' },
  chipText: { fontSize: 12, fontWeight: '800', color: '#EC407A' },
  colorsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSel: { borderWidth: 3, borderColor: '#2D1220' },
  saveBtn: {
    backgroundColor: '#EC407A', borderRadius: 50,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
})
