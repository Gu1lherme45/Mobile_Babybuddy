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

function passStrength(v) {
  let s = 0
  if (v.length >= 8)          s++
  if (/[a-z]/.test(v))        s++
  if (/[A-Z]/.test(v))        s++
  if (/[0-9]/.test(v))        s++
  if (/[^a-zA-Z0-9]/.test(v)) s++
  return s
}
const STRENGTH_LABEL = ['', 'Fraca', 'Razoável', 'Boa', 'Forte', 'Muito forte']
const STRENGTH_COLOR = ['', '#E53935', '#FF8C00', '#F9A825', '#27AE60', '#1B5E20']

export default function RegisterScreen({ navigation }) {
  const { register, authLoading, authError, setAuthError } = useApp()

  const [nome, setNome]         = useState('')
  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)

  const [nomeErr, setNomeErr]     = useState('')
  const [emailErr, setEmailErr]   = useState('')
  const [passErr, setPassErr]     = useState('')
  const [confErr, setConfErr]     = useState('')

  const strength = passStrength(pass)

  function validateAll() {
    let ok = true

    if (!nome.trim()) {
      setNomeErr('Nome obrigatório'); ok = false
    } else setNomeErr('')

    if (!email.trim()) {
      setEmailErr('E-mail obrigatório'); ok = false
    } else if (!EMAIL_RE.test(email)) {
      setEmailErr('Formato inválido (ex: nome@email.com)'); ok = false
    } else setEmailErr('')

    if (!pass) {
      setPassErr('Senha obrigatória'); ok = false
    } else if (pass.length < 8) {
      setPassErr('Mínimo de 8 caracteres'); ok = false
    } else if (!/[a-z]/.test(pass)) {
      setPassErr('Inclua ao menos uma letra minúscula'); ok = false
    } else if (!/[A-Z]/.test(pass)) {
      setPassErr('Inclua ao menos uma letra maiúscula'); ok = false
    } else if (!/[0-9]/.test(pass)) {
      setPassErr('Inclua ao menos um número'); ok = false
    } else if (!/[^a-zA-Z0-9]/.test(pass)) {
      setPassErr('Inclua ao menos um caractere especial'); ok = false
    } else setPassErr('')

    if (pass !== confirm) {
      setConfErr('As senhas não coincidem'); ok = false
    } else setConfErr('')

    return ok
  }

  async function handleRegister() {
    setAuthError('')
    if (!validateAll()) return
    const ok = await register(nome.trim(), email.trim(), pass)
    if (ok) navigation.replace('Welcome')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <LinearGradient colors={['#EC407A', '#FF6FAD']} style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="back" color="#fff" size={20} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.iconCircle}>
                <Icon name="baby" color="#fff" size={32} />
              </View>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>

            {/* Erro backend */}
            {!!authError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            )}

            {/* Nome */}
            <Text style={styles.label}>SEU NOME</Text>
            <TextInput
              style={[styles.input, nomeErr ? styles.inputErr : null]}
              placeholder="Como você se chama?"
              placeholderTextColor="#C9A8B5"
              value={nome}
              onChangeText={v => { setNome(v); setNomeErr('') }}
              autoCapitalize="words"
            />
            {!!nomeErr && <Text style={styles.errText}>{nomeErr}</Text>}

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
            />
            {!!emailErr && <Text style={styles.errText}>{emailErr}</Text>}

            {/* Senha */}
            <Text style={styles.label}>SENHA</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1 }, passErr ? styles.inputErr : null]}
                placeholder="Mín. 8 caracteres"
                placeholderTextColor="#C9A8B5"
                value={pass}
                onChangeText={v => { setPass(v); setPassErr(''); setAuthError('') }}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(s => !s)}>
                <Text style={styles.eyeText}>{showPass ? 'ocultar' : 'ver'}</Text>
              </TouchableOpacity>
            </View>

            {/* Barra de força da senha */}
            {pass.length > 0 && (
              <View style={{ marginBottom: 4 }}>
                <View style={styles.strengthRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[styles.strengthBar, { backgroundColor: i <= strength ? STRENGTH_COLOR[strength] : '#F5DAE4' }]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: STRENGTH_COLOR[strength] }]}>
                  {STRENGTH_LABEL[strength]}
                </Text>
              </View>
            )}
            {!!passErr && <Text style={styles.errText}>{passErr}</Text>}

            {/* Confirmar senha */}
            <Text style={styles.label}>CONFIRMAR SENHA</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1 }, confErr ? styles.inputErr : null]}
                placeholder="Repita a senha"
                placeholderTextColor="#C9A8B5"
                value={confirm}
                onChangeText={v => { setConfirm(v); setConfErr('') }}
                secureTextEntry={!showConf}
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConf(s => !s)}>
                <Text style={styles.eyeText}>{showConf ? 'ocultar' : 'ver'}</Text>
              </TouchableOpacity>
            </View>
            {!!confErr && <Text style={styles.errText}>{confErr}</Text>}

            {/* Botão criar conta */}
            <TouchableOpacity
              style={[styles.btnPrimary, authLoading && { backgroundColor: '#FFB7CD' }]}
              onPress={handleRegister}
              disabled={authLoading}
            >
              {authLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnPrimaryText}>Criar Conta</Text>
              }
            </TouchableOpacity>

            {/* Voltar para login */}
            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.goBack()}>
              <Text style={styles.btnOutlineText}>Já tenho uma conta</Text>
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
    paddingTop: 16, paddingBottom: 36, paddingHorizontal: 20,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  headerCenter: { alignItems: 'center', gap: 8 },
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
  label: { fontSize: 10, fontWeight: '900', color: '#A07080', letterSpacing: 1, marginTop: 6 },
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
  strengthRow: { flexDirection: 'row', gap: 4, marginBottom: 3 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 10, fontWeight: '800' },
  btnPrimary: {
    backgroundColor: '#EC407A', borderRadius: 50,
    paddingVertical: 14, alignItems: 'center', marginTop: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  btnOutline: {
    borderRadius: 50, borderWidth: 1.5, borderColor: '#F5DAE4',
    paddingVertical: 13, alignItems: 'center',
  },
  btnOutlineText: { color: '#EC407A', fontSize: 13, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: 12, color: '#C9A8B5', fontWeight: '700', padding: 20 },
})
