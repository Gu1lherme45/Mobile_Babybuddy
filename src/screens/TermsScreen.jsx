import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/Icon'

const SECTIONS = [
  {
    title: '1. Aceitação dos termos',
    text: 'Ao criar uma conta e usar o BabyBuddy, você concorda com estes Termos de Uso. Se não concordar, não utilize o aplicativo.',
  },
  {
    title: '2. Uso permitido',
    text: 'O BabyBuddy destina-se ao uso pessoal de gestantes para acompanhamento de saúde, lembretes e organização da gravidez. É proibido usar o aplicativo para fins ilícitos ou prejudiciais a terceiros.',
  },
  {
    title: '3. Informações de saúde',
    text: 'As informações registradas no BabyBuddy (semanas, consultas, peso etc.) são apenas de uso organizacional e não substituem orientação médica profissional. Sempre consulte um médico.',
  },
  {
    title: '4. Conta e segurança',
    text: 'Você é responsável pela segurança da sua senha e pela sua conta. Em caso de uso não autorizado, notifique-nos imediatamente pelo suporte.',
  },
  {
    title: '5. Alterações nos termos',
    text: 'Podemos atualizar estes Termos periodicamente. Continuando a usar o aplicativo após as alterações, você aceita os novos termos.',
  },
  {
    title: '6. Contato',
    text: 'Para esclarecimentos sobre estes Termos de Uso, entre em contato pelo e-mail suporte@babybuddy.com.',
  },
]

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" color="#fff" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.updated}>Vigência: junho de 2026</Text>
        {SECTIONS.map(s => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sTitle}>{s.title}</Text>
            <Text style={styles.sText}>{s.text}</Text>
          </View>
        ))}
      </ScrollView>
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
  body: { padding: 20, paddingBottom: 40 },
  updated: { fontSize: 11, color: '#A07080', fontWeight: '600', marginBottom: 16 },
  section: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#EC407A', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sTitle: { fontSize: 13, fontWeight: '900', color: '#2D1220', marginBottom: 8 },
  sText: { fontSize: 12, color: '#7A5060', fontWeight: '500', lineHeight: 20 },
})
