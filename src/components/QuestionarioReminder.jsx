import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useQuestionario } from '../context/QuestionarioContext'
import { Icon } from './Icon'

export default function QuestionarioReminder({ navigation }) {
  const { pending, draft } = useQuestionario()
  if (!pending) return null
  return (
    <TouchableOpacity style={styles.card} accessibilityRole="button" onPress={() => navigation.navigate('Questionario')}>
      <View style={styles.icon}><Icon name="heart" size={24} color="#C0255B" /></View>
      <View style={styles.content}>
        <Text style={styles.title}>Questionário de saúde pendente</Text>
        <Text style={styles.description}>Responda no seu tempo para completar seu acompanhamento.</Text>
        <Text style={styles.link}>{draft ? 'Continuar preenchimento' : 'Responder questionário'}</Text>
      </View>
      <Icon name="fwd" color="#C0255B" size={18} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 20, backgroundColor: '#FFF5F8', borderWidth: 1, borderColor: '#EBB7CB', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FCE4ED', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, gap: 5 }, title: { color: '#422431', fontSize: 15, fontWeight: '800' },
  description: { color: '#71505D', fontSize: 13, lineHeight: 20 }, link: { color: '#A92251', fontSize: 14, fontWeight: '700', marginTop: 4 },
})
