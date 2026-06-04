import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/Icon'

const SECTIONS = [
  {
    title: '1. Dados coletados',
    text: 'O BabyBuddy coleta nome, e-mail e senha para criação de conta. Além disso, armazena localmente no dispositivo dados de saúde preenchidos por você (semanas de gestação, peso, médico, entre outros), lembretes e eventos do calendário.',
  },
  {
    title: '2. Uso dos dados',
    text: 'Seus dados são utilizados exclusivamente para prover as funcionalidades do aplicativo. Não compartilhamos suas informações com terceiros, anunciantes ou qualquer entidade externa.',
  },
  {
    title: '3. Armazenamento e segurança',
    text: 'As credenciais de acesso são armazenadas de forma segura no dispositivo usando Expo SecureStore. Os dados de perfil e calendário são salvos localmente via AsyncStorage, vinculados ao seu e-mail.',
  },
  {
    title: '4. Seus direitos',
    text: 'Você pode editar ou excluir seus dados a qualquer momento nas configurações do aplicativo. A exclusão de conta remove permanentemente todos os dados do servidor e do dispositivo.',
  },
  {
    title: '5. Contato',
    text: 'Em caso de dúvidas sobre esta política, entre em contato pelo e-mail suporte@babybuddy.com.',
  },
]

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" color="#fff" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.updated}>Última atualização: junho de 2026</Text>
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
