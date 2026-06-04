import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

const FIELDS = [
  { key: 'name',      label: 'SEU NOME',             placeholder: 'Como você se chama?',    keyboard: 'default' },
  { key: 'weeks',     label: 'SEMANAS DE GESTAÇÃO',   placeholder: 'Ex: 24',                 keyboard: 'numeric' },
  { key: 'due',       label: 'DATA PREVISTA (AAAA-MM-DD)', placeholder: 'Ex: 2026-10-15',    keyboard: 'numbers-and-punctuation' },
  { key: 'doctor',    label: 'MÉDICO/A',              placeholder: 'Nome do/a médico/a',      keyboard: 'default' },
  { key: 'hospital',  label: 'HOSPITAL / MATERNIDADE', placeholder: 'Nome do local',          keyboard: 'default' },
  { key: 'weight',    label: 'PESO (kg)',              placeholder: 'Ex: 65',                  keyboard: 'numeric' },
  { key: 'height',    label: 'ALTURA (cm)',            placeholder: 'Ex: 165',                 keyboard: 'numeric' },
  { key: 'blood',     label: 'TIPO SANGUÍNEO',        placeholder: 'Ex: A+',                  keyboard: 'default' },
  { key: 'allergies', label: 'ALERGIAS',               placeholder: 'Ex: Dipirona',            keyboard: 'default' },
]

export default function PersonalDataScreen({ navigation }) {
  const { profile, setProfile } = useApp()
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setProfile(form)
    setSaved(true)
    setTimeout(() => navigation.goBack(), 600)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="back" color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {FIELDS.map(f => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor="#C9A8B5"
                value={form[f.key] || ''}
                onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                keyboardType={f.keyboard}
                autoCapitalize={f.keyboard === 'default' ? 'words' : 'none'}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveBtn, saved && { backgroundColor: '#27AE60' }]}
            onPress={handleSave}
          >
            <Icon name={saved ? 'check' : 'ok'} color="#fff" size={18} />
            <Text style={styles.saveBtnText}>{saved ? 'Salvo!' : 'Salvar Dados'}</Text>
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
  label: { fontSize: 10, fontWeight: '900', color: '#A07080', letterSpacing: 1, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#F5DAE4',
    borderRadius: 50, paddingHorizontal: 18, paddingVertical: 13,
    fontSize: 13, color: '#2D1220', fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#EC407A', borderRadius: 50,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
})
