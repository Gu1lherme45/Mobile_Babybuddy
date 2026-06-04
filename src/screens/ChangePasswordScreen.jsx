import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

function validate(v) {
  if (!v) return 'Senha obrigatória'
  if (v.length < 8) return 'Mínimo de 8 caracteres'
  if (!/[a-z]/.test(v)) return 'Inclua ao menos uma letra minúscula'
  if (!/[A-Z]/.test(v)) return 'Inclua ao menos uma letra maiúscula'
  if (!/[0-9]/.test(v)) return 'Inclua ao menos um número'
  if (!/[^a-zA-Z0-9]/.test(v)) return 'Inclua ao menos um caractere especial'
  return ''
}

export default function ChangePasswordScreen({ navigation }) {
  const { changePassword } = useApp()
  const [newPass, setNewPass]       = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showNew, setShowNew]       = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [passErr, setPassErr]       = useState('')
  const [confErr, setConfErr]       = useState('')
  const [apiErr, setApiErr]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  async function handleSave() {
    const pErr = validate(newPass)
    setPassErr(pErr)
    const cErr = newPass !== confirm ? 'As senhas não coincidem' : ''
    setConfErr(cErr)
    if (pErr || cErr) return

    setLoading(true)
    setApiErr('')
    try {
      await changePassword(newPass)
      setSuccess(true)
      setTimeout(() => navigation.goBack(), 1200)
    } catch (err) {
      setApiErr(err.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="back" color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {!!apiErr && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{apiErr}</Text>
            </View>
          )}

          <Text style={styles.label}>NOVA SENHA</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1 }, passErr ? styles.inputErr : null]}
              placeholder="••••••••"
              placeholderTextColor="#C9A8B5"
              value={newPass}
              onChangeText={v => { setNewPass(v); setPassErr('') }}
              secureTextEntry={!showNew}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(s => !s)}>
              <Text style={styles.eyeText}>{showNew ? 'ocultar' : 'ver'}</Text>
            </TouchableOpacity>
          </View>
          {!!passErr && <Text style={styles.errText}>{passErr}</Text>}

          <Text style={styles.label}>CONFIRMAR NOVA SENHA</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1 }, confErr ? styles.inputErr : null]}
              placeholder="••••••••"
              placeholderTextColor="#C9A8B5"
              value={confirm}
              onChangeText={v => { setConfirm(v); setConfErr('') }}
              secureTextEntry={!showConf}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConf(s => !s)}>
              <Text style={styles.eyeText}>{showConf ? 'ocultar' : 'ver'}</Text>
            </TouchableOpacity>
          </View>
          {!!confErr && <Text style={styles.errText}>{confErr}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, (loading || success) && { backgroundColor: success ? '#27AE60' : '#FFB7CD' }]}
            onPress={handleSave}
            disabled={loading || success}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Icon name={success ? 'check' : 'shield'} color="#fff" size={18} />
                  <Text style={styles.saveBtnText}>{success ? 'Senha alterada!' : 'Salvar Nova Senha'}</Text>
                </>
            }
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
  errorBox: {
    backgroundColor: '#fff0f3', borderWidth: 1.5, borderColor: '#FFB7CD',
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  errorBoxText: { fontSize: 12, color: '#E53935', fontWeight: '700' },
  label: { fontSize: 10, fontWeight: '900', color: '#A07080', letterSpacing: 1, marginTop: 10 },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#F5DAE4',
    borderRadius: 50, paddingHorizontal: 18, paddingVertical: 13,
    fontSize: 13, color: '#2D1220', fontWeight: '600',
  },
  inputErr: { borderColor: '#E53935' },
  errText: { fontSize: 11, color: '#E53935', fontWeight: '700', paddingLeft: 6 },
  eyeBtn: { position: 'absolute', right: 16 },
  eyeText: { fontSize: 11, fontWeight: '800', color: '#C9A8B5' },
  saveBtn: {
    backgroundColor: '#EC407A', borderRadius: 50,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
})
