import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/Icon'

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#EC407A', '#FF6FAD']} style={styles.screen}>
        {/* Círculos decorativos */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View />

        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <Icon name="baby" color="#fff" size={50} />
          </View>
          <Text style={styles.title}>Olá, mamãe!</Text>
          <Text style={styles.subtitle}>
            O BabyBuddy vai te acompanhar em cada semana especial da sua gravidez com muito carinho.
          </Text>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.replace('Main')}
          >
            <Text style={styles.btnText}>Começar agora</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>BabyBuddy · Feito para você</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 28, justifyContent: 'space-between', overflow: 'hidden' },
  circle1: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circle2: {
    position: 'absolute', bottom: -40, left: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  center: { alignItems: 'center' },
  iconWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 12, letterSpacing: 0.3 },
  subtitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: '600',
    lineHeight: 22, textAlign: 'center', maxWidth: 260,
  },
  bottom: { alignItems: 'center', gap: 14 },
  btn: {
    backgroundColor: '#fff', borderRadius: 50,
    paddingVertical: 16, paddingHorizontal: 48, width: '100%', alignItems: 'center',
  },
  btnText: { color: '#EC407A', fontWeight: '900', fontSize: 15 },
  footer: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '800' },
})
