import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../components/Icon'
import { useQuestionario } from '../context/QuestionarioContext'
import { alterarResposta, dadosExistentes, digitarData, ESTADO_INICIAL, etapasVisiveis, exibirData, validarEtapa, validarQuestionario } from '../domain/questionario/Questionario'

export default function QuestionarioScreen({ navigation }) {
  const { gestante, questionario, draft, extras, loading, ready, error, storageError, saving, refresh, saveDraft, submit } = useQuestionario()
  const [dados, setDados] = useState(ESTADO_INICIAL)
  const [campo, setCampo] = useState('dataNascimento')
  const [fase, setFase] = useState('inicio')
  const [erro, setErro] = useState('')
  const [pausing, setPausing] = useState(false)
  const started = useRef(false)
  const submitting = useRef(false)
  const scroll = useRef(null)
  const etapas = etapasVisiveis(dados)
  const index = Math.max(0, etapas.findIndex(etapa => etapa.campo === campo))
  const etapa = etapas[index]
  const busy = saving || pausing

  useEffect(() => {
    if (started.current || !ready || loading) return
    setDados(draft?.dados ? { ...ESTADO_INICIAL, ...draft.dados } : dadosExistentes(gestante, questionario, extras))
    if (draft?.campo) setCampo(draft.campo)
  }, [ready, loading, gestante, questionario, draft, extras])

  function sair() {
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.replace('Main')
  }

  function voltar() {
    if (busy) return
    setErro('')
    if (index === 0) setFase('inicio')
    else {
      setCampo(etapas[index - 1].campo)
      saveDraft(dados, etapas[index - 1].campo)
    }
  }

  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (busy) return true
      if (fase === 'perguntas') { voltar(); return true }
      return false
    })
    return () => listener.remove()
  }, [busy, fase, index, dados]))

  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }) }, [campo, fase])

  function alterar(chave, valor) {
    const next = alterarResposta(dados, chave, valor)
    setDados(next)
    setErro('')
    saveDraft(next, campo)
  }

  async function adiar() {
    if (busy || submitting.current) return
    if (started.current) {
      setPausing(true)
      const saved = await saveDraft(dados, campo)
      setPausing(false)
      if (!saved) return
    }
    sair()
  }

  async function avancar() {
    if (busy || submitting.current) return
    const mensagem = validarEtapa(etapa, dados)
    if (mensagem) { setErro(mensagem); return }
    if (index < etapas.length - 1) {
      const proximo = etapas[index + 1].campo
      setCampo(proximo)
      setErro('')
      saveDraft(dados, proximo)
      return
    }
    const invalido = validarQuestionario(dados)
    if (invalido) { setCampo(invalido.campo); setErro(invalido.mensagem); return }
    submitting.current = true
    setErro('')
    try {
      if (await submit(dados)) setFase('final')
    } catch (_) {
      setErro('Não foi possível enviar o questionário. Suas respostas foram mantidas. Verifique a conexão e tente novamente.')
    } finally {
      submitting.current = false
    }
  }

  function renderCampo() {
    if (etapa.tipo === 'date' || etapa.tipo === 'weeks') {
      return (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{etapa.tipo === 'date' ? 'Dia / Mês / Ano' : 'Semana de gestação (1 a 42)'}</Text>
          <TextInput
            accessibilityLabel={etapa.pergunta}
            style={[styles.input, !!erro && styles.inputError]}
            value={etapa.tipo === 'date' ? exibirData(dados[campo]) : dados[campo]}
            onChangeText={valor => alterar(campo, etapa.tipo === 'date' ? digitarData(valor) : valor.replace(/\D/g, ''))}
            keyboardType="number-pad" placeholder={etapa.tipo === 'date' ? 'DD/MM/AAAA' : 'Ex.: 24'}
            placeholderTextColor="#8F6B7A" maxLength={etapa.tipo === 'date' ? 10 : 2} editable={!busy}
          />
          {campo === 'dpp' && <Text style={styles.hint}>Sugerimos esta data a partir da semana de gestação informada. Confira a previsão com seu acompanhamento pré-natal.</Text>}
        </View>
      )
    }
    if (etapa.tipo === 'checkbox') {
      return (
        <View style={styles.fieldGroup}>
          <TouchableOpacity
            style={[styles.option, dados.aceitouTermos && styles.optionSelected]}
            accessibilityRole="checkbox" accessibilityState={{ checked: dados.aceitouTermos, disabled: busy }}
            onPress={() => alterar('aceitouTermos', !dados.aceitouTermos)} disabled={busy}
          >
            <View style={[styles.checkBox, dados.aceitouTermos && styles.checkBoxSelected]}>
              {dados.aceitouTermos && <Icon name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.optionLabel}>Declaro que li e aceito os Termos de Uso e a Política de Privacidade do BabyBuddy.</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="link" style={styles.linkButton} onPress={() => navigation.navigate('Terms')} disabled={busy}>
            <Text style={styles.linkText}>Ler Termos de Uso</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="link" style={styles.linkButton} onPress={() => navigation.navigate('Privacy')} disabled={busy}>
            <Text style={styles.linkText}>Ler Política de Privacidade</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View style={styles.fieldGroup}>
        <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={etapa.pergunta}>
          {etapa.opcoes.map(opcao => (
            <TouchableOpacity
              key={opcao} style={[styles.option, dados[campo] === opcao && styles.optionSelected]}
              accessibilityRole="radio" accessibilityState={{ checked: dados[campo] === opcao, disabled: busy }}
              onPress={() => alterar(campo, opcao)} disabled={busy}
            >
              <View style={[styles.radio, dados[campo] === opcao && styles.radioSelected]}>
                {dados[campo] === opcao && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.optionLabel}>{opcao}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {etapa.condicional && dados[campo] === etapa.condicional.valor && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{etapa.condicional.label}</Text>
            <TextInput
              accessibilityLabel={etapa.condicional.label} style={[styles.input, styles.multiline]}
              value={dados[etapa.condicional.campo]} onChangeText={valor => alterar(etapa.condicional.campo, valor)}
              placeholder="Conte um pouco mais" placeholderTextColor="#8F6B7A"
              maxLength={200} multiline editable={!busy}
            />
            <Text style={styles.hint}>Até 200 caracteres.</Text>
          </View>
        )}
        {campo === 'autorizaUsoDados' && (
          <Text style={styles.hint}>Você pode escolher “Não” e continuar usando o aplicativo.</Text>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
          <Text style={styles.headerTitle}>Questionário de saúde</Text>
          <Text style={styles.headerSubtitle}>Anamnese · Seu cuidado começa por você</Text>
        </LinearGradient>
        <ScrollView ref={scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {fase === 'inicio' && (
            <View style={styles.card}>
              <View style={styles.heroIcon}><Icon name="heart" size={48} color="#C0255B" /></View>
              <Text style={styles.eyebrow}>NO SEU TEMPO</Text>
              <Text style={styles.title}>{questionario ? 'Atualize seus dados de saúde' : 'Sua saúde importa'}</Text>
              <Text style={styles.description}>Conte um pouco sobre você e sua gestação para ajudar no seu acompanhamento.</Text>
              <View style={styles.notice}>
                <Icon name="clock" size={21} color="#C0255B" />
                <Text style={styles.noticeText}>O preenchimento é opcional. Você pode responder depois pelo perfil ou pelas notificações. O lembrete permanece até a conclusão.</Text>
              </View>
              {draft && <Text style={styles.hint}>Você tem respostas salvas neste aparelho. Continue de onde parou.</Text>}
              {loading && <ActivityIndicator accessibilityLabel="Carregando questionário" color="#C0255B" />}
              {!!error && (
                <View style={styles.fieldGroup}>
                  <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                  <TouchableOpacity style={styles.linkButton} accessibilityRole="button" onPress={refresh} disabled={loading}>
                    <Text style={styles.linkText}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={[styles.primary, (!ready || loading) && styles.disabled]} accessibilityRole="button"
                accessibilityState={{ disabled: !ready || loading }} disabled={!ready || loading}
                onPress={() => { started.current = true; setFase('perguntas'); saveDraft(dados, campo) }}
              >
                <Text style={styles.primaryText}>{draft ? 'Continuar questionário' : questionario ? 'Revisar questionário' : 'Responder agora'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} accessibilityRole="button" onPress={adiar} disabled={busy}>
                <Text style={styles.linkText}>Responder depois</Text>
              </TouchableOpacity>
            </View>
          )}
          {fase === 'perguntas' && (
            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <TouchableOpacity style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar à pergunta anterior" onPress={voltar} disabled={busy}>
                  <Icon name="back" size={22} color="#C0255B" />
                </TouchableOpacity>
                <Text style={styles.stepText}>Etapa {index + 1} de {etapas.length}</Text>
              </View>
              <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: etapas.length, now: index + 1 }}>
                <View style={[styles.progress, { width: `${((index + 1) / etapas.length) * 100}%` }]} />
              </View>
              <Text accessibilityRole="header" style={styles.question}>{etapa.pergunta}</Text>
              {renderCampo()}
              {!!erro && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{erro}</Text>}
              <TouchableOpacity style={[styles.primary, busy && styles.disabled]} accessibilityRole="button" disabled={busy} accessibilityState={{ disabled: busy, busy }} onPress={avancar}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{index === etapas.length - 1 ? (questionario ? 'Atualizar dados' : 'Finalizar questionário') : 'Continuar'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} accessibilityRole="button" onPress={adiar} disabled={busy}>
                <Text style={styles.linkText}>{pausing ? 'Salvando progresso…' : 'Salvar e continuar depois'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {fase === 'final' && (
            <View style={styles.card}>
              <View style={styles.heroIcon}><Icon name="check" size={48} color="#C0255B" /></View>
              <Text style={styles.title}>Tudo pronto!</Text>
              <Text style={styles.description}>Suas respostas foram enviadas. Você pode revisar o questionário quando quiser pelo seu perfil.</Text>
              <TouchableOpacity style={styles.primary} accessibilityRole="button" onPress={sair}>
                <Text style={styles.primaryText}>Continuar no aplicativo</Text>
              </TouchableOpacity>
            </View>
          )}
          {!!storageError && <Text accessibilityRole="alert" style={styles.error}>{storageError}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: '#F8F0F5' },
  header: { padding: 22, gap: 6 }, headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSubtitle: { color: '#fff', fontSize: 13 },
  body: { padding: 18, paddingBottom: 36, flexGrow: 1, width: '100%', maxWidth: 620, alignSelf: 'center', gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, gap: 18 },
  heroIcon: { width: 94, height: 94, borderRadius: 47, backgroundColor: '#FCE4ED', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 8 },
  eyebrow: { textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: '#9C2A53' },
  title: { fontSize: 26, fontWeight: '800', color: '#2D1220', textAlign: 'center' },
  description: { fontSize: 16, lineHeight: 25, color: '#71505D', textAlign: 'center' },
  notice: { backgroundColor: '#FFF1F6', borderRadius: 16, padding: 15, flexDirection: 'row', gap: 10 },
  noticeText: { flex: 1, color: '#714353', fontSize: 14, lineHeight: 22 },
  primary: { backgroundColor: '#C0255B', borderRadius: 28, minHeight: 52, padding: 15, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center' },
  disabled: { opacity: 0.5 }, linkButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', padding: 8 },
  linkText: { color: '#A92251', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1F6', borderRadius: 22 },
  stepText: { color: '#71505D', fontWeight: '700', fontSize: 14 },
  track: { height: 7, borderRadius: 4, backgroundColor: '#F7DFE9', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#C0255B', borderRadius: 4 },
  question: { color: '#2D1220', fontSize: 23, fontWeight: '800', lineHeight: 32, marginVertical: 8 },
  fieldGroup: { gap: 10 }, label: { fontSize: 14, color: '#71505D', fontWeight: '700' },
  input: { borderWidth: 1.5, borderColor: '#DDB6C6', borderRadius: 16, padding: 16, color: '#2D1220', fontSize: 17, minHeight: 54, backgroundColor: '#FFFAFC' },
  multiline: { minHeight: 100, textAlignVertical: 'top' }, inputError: { borderColor: '#B42342' },
  hint: { fontSize: 13, lineHeight: 21, color: '#71505D' },
  options: { gap: 10 }, option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#EBD3DE', minHeight: 56 },
  optionSelected: { borderColor: '#C0255B', backgroundColor: '#FFF1F6' }, optionLabel: { fontSize: 16, color: '#422431', flex: 1, lineHeight: 24 },
  radio: { width: 22, height: 22, borderWidth: 2, borderColor: '#B18B9B', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#C0255B' }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C0255B' },
  checkBox: { width: 24, height: 24, borderRadius: 5, borderColor: '#B18B9B', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkBoxSelected: { backgroundColor: '#C0255B', borderColor: '#C0255B' },
  error: { color: '#B42342', fontSize: 14, lineHeight: 22 },
})
