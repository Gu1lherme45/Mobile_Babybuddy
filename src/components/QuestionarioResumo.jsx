import { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Icon } from './Icon'
import { obterQuestionarioDoUsuario } from '../application/questionario'
import Questionario from '../domain/questionario/Questionario'

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function respostas(questionario) {
  const semana = Questionario.semanaAtual(questionario.dataPrevistaParto)
  const condicao = questionario.condicaoSaude === 'Outra' && questionario.condicaoSaudeOutra
    ? questionario.condicaoSaudeOutra
    : questionario.condicaoSaude
  const alergia = questionario.possuiAlergia === 'Sim' && questionario.alergiaEspecificacao
    ? questionario.alergiaEspecificacao
    : questionario.possuiAlergia
  return [
    ['Semana atual', semana ? `${semana}ª semana` : ''],
    ['Data prevista do parto', fmtDate(questionario.dataPrevistaParto)],
    ['Primeira gestação', questionario.primeiraGestacao],
    ['Tipo sanguíneo', questionario.tipoSanguineo],
    ['Condição de saúde', condicao],
    ['Pré-natal regular', questionario.prenatalRegular],
    ['Alergias', alergia],
  ].filter(([, valor]) => valor)
}

export default function QuestionarioResumo({ usuarioId }) {
  const [questionario, setQuestionario] = useState(null)
  const [loading, setLoading] = useState(Boolean(usuarioId))
  const [error, setError] = useState('')

  const load = useCallback(() => {
    if (!usuarioId) return undefined
    let ativo = true
    setLoading(true)
    setError('')
    obterQuestionarioDoUsuario(usuarioId)
      .then(dados => { if (ativo) setQuestionario(dados) })
      .catch(() => { if (ativo) setError('Não foi possível carregar suas respostas agora.') })
      .finally(() => { if (ativo) setLoading(false) })
    return () => { ativo = false }
  }, [usuarioId])

  // Recarrega sempre que o Perfil volta a aparecer: a usuária pode ter respondido
  // ou revisado o questionário no site enquanto o app estava aberto.
  useFocusEffect(load)

  let conteudo
  if (loading && !questionario) {
    conteudo = <ActivityIndicator color="#EC407A" style={styles.loading} />
  } else if (error && !questionario) {
    conteudo = (
      <>
        <Text style={styles.message}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </>
    )
  } else if (!questionario) {
    conteudo = (
      <Text style={styles.message}>
        Você ainda não respondeu o questionário de saúde. Responda pelo site do BabyBuddy e suas respostas aparecem aqui.
      </Text>
    )
  } else {
    conteudo = respostas(questionario).map(([rotulo, valor], index) => (
      <View key={rotulo} style={[styles.row, index > 0 && styles.rowDivider]}>
        <Text style={styles.label}>{rotulo}</Text>
        <Text style={styles.value}>{valor}</Text>
      </View>
    ))
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="heart" color="#EC407A" size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Questionário de saúde</Text>
          {!!questionario?.dataPreenchimento && (
            <Text style={styles.subtitle}>Respondido no site em {fmtDate(questionario.dataPreenchimento)}</Text>
          )}
        </View>
      </View>
      {conteudo}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 8,
    shadowColor: '#EC407A', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  iconWrap: {
    width: 38, height: 38, borderRadius: 14,
    backgroundColor: '#FFF5F8', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '800', color: '#2D1220' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#A07080', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 9 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#F5DAE4' },
  label: { fontSize: 12, fontWeight: '700', color: '#A07080' },
  value: { flex: 1, flexShrink: 1, textAlign: 'right', fontSize: 13, fontWeight: '800', color: '#2D1220' },
  message: { fontSize: 12, lineHeight: 18, color: '#8A6575' },
  loading: { paddingVertical: 12 },
  retryBtn: {
    alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 12, backgroundColor: '#FFF5F8',
  },
  retryText: { fontSize: 12, fontWeight: '800', color: '#EC407A' },
})
