import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function LoginScreen({ navigation }) {
  const { login, authLoading, authError, setAuthError } = useApp()

  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [passErr, setPassErr]   = useState('')

  function validateEmail(v) {
    if (!v.trim()) return 'E-mail obrigatório'
    if (!EMAIL_RE.test(v)) return 'Formato inválido (ex: nome@email.com)'
    return ''
  }

async function handleLogin() {
  const eErr = validateEmail(email)
  setEmailErr(eErr)
  if (eErr) return

  if (!pass) { setPassErr('Senha obrigatória'); return }
  setPassErr('')
  setAuthError('')

  // Apenas espere a função terminar. Se der 'ok', o contexto muda o estado
  // e o AppNavigator te joga para a tela correta automaticamente!
  await login(email, pass)
}

  function goToRegister() {
    setAuthError('')
    navigation.navigate('Register')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <LinearGradient colors={['#EC407A', '#FF6FAD']} style={styles.header}>
            <View style={styles.iconCircle}>
              <Icon name="baby" color="#fff" size={32} />
            </View>
            <Text style={styles.title}>BabyBuddy</Text>
            <Text style={styles.subtitle}>Bem-vinda de volta!</Text>
          </LinearGradient>

          <View style={styles.body}>

            {/* Erro do backend */}
            {!!authError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            )}

            {/* E-mail */}
            <Text style={styles.label}>E-MAIL</Text>
            <TextInput
              style={[styles.input, emailErr ? styles.inputErr : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#C9A8B5"
              value={email}
              onChangeText={v => { setEmail(v); setEmailErr('') }}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
            />
            {!!emailErr && <Text style={styles.errText}>{emailErr}</Text>}

            {/* Senha */}
            <Text style={styles.label}>SENHA</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1 }, passErr ? styles.inputErr : null]}
                placeholder="••••••••"
                placeholderTextColor="#C9A8B5"
                value={pass}
                onChangeText={v => { setPass(v); setPassErr(''); setAuthError('') }}
                secureTextEntry={!showPass}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(s => !s)}>
                <Text style={styles.eyeText}>{showPass ? 'ocultar' : 'ver'}</Text>
              </TouchableOpacity>
            </View>
            {!!passErr && <Text style={styles.errText}>{passErr}</Text>}

            {/* Botão entrar */}
            <TouchableOpacity
              style={[styles.btnPrimary, authLoading && { backgroundColor: '#FFB7CD' }]}
              onPress={handleLogin}
              disabled={authLoading}
            >
              {authLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnPrimaryText}>Entrar</Text>
              }
            </TouchableOpacity>

            {/* Link para cadastro */}
            <TouchableOpacity style={styles.btnOutline} onPress={goToRegister}>
              <Text style={styles.btnOutlineText}>Criar nova conta</Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.footer}>BabyBuddy · Seus dados, sempre seguros</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1 },
  header: {
    padding: 36, paddingBottom: 40,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    alignItems: 'center', gap: 8,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 22, color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  body:     { flex: 1, padding: 28, gap: 10 },
  errorBox: {
    backgroundColor: '#fff0f3', borderWidth: 1.5, borderColor: '#FFB7CD',
    borderRadius: 12, padding: 10,
  },
  errorBoxText: { fontSize: 12, color: '#E53935', fontWeight: '700' },
  label:    { fontSize: 10, fontWeight: '900', color: '#A07080', letterSpacing: 1, marginTop: 6 },
  input: {
    backgroundColor: '#FFF5F8', borderWidth: 1.5, borderColor: '#F5DAE4',
    borderRadius: 50, paddingHorizontal: 18, paddingVertical: 13,
    fontSize: 13, color: '#2D1220', fontWeight: '600',
  },
  inputErr:    { borderColor: '#E53935', backgroundColor: '#fff5f5' },
  errText:     { fontSize: 11, color: '#E53935', fontWeight: '700', paddingLeft: 6 },
  passRow:     { flexDirection: 'row', alignItems: 'center' },
  eyeBtn:      { position: 'absolute', right: 16 },
  eyeText:     { fontSize: 11, fontWeight: '800', color: '#C9A8B5' },
  btnPrimary: {
    backgroundColor: '#EC407A', borderRadius: 50,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  btnOutline: {
    borderRadius: 50, borderWidth: 1.5, borderColor: '#F5DAE4',
    paddingVertical: 13, alignItems: 'center',
  },
  btnOutlineText: { color: '#EC407A', fontSize: 13, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: 12, color: '#C9A8B5', fontWeight: '700', padding: 20 },
})
