import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function HomeScreen({ navigation }) {
  const { currentUser, profile, reminders, events } = useApp()
  const name = profile.name || currentUser?.nome || null
  const wk = profile.weeks ? parseInt(profile.weeks) : null
  const pct = wk ? Math.round((wk / 40) * 100) : 0

  const actions = [
    { ic: 'cal',   lb: 'Novo Evento',   screen: 'AddEvent',    colors: ['#EC407A', '#FF6FAD'] },
    { ic: 'bell',  lb: 'Novo Lembrete', screen: 'AddReminder', colors: ['#FF6FAD', '#FFB7CD'] },
    { ic: 'user',  lb: 'Meus Dados',    screen: 'PersonalData',colors: ['#C0255B', '#EC407A'] },
    { ic: 'clock', lb: 'Calendário',    screen: null,          colors: ['#F48FB1', '#EC407A'] },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      {/* Header pink */}
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerHello}>{name ? `Olá, ${name}!` : 'Olá!'}</Text>
            <Text style={styles.headerTitle}>Como você está?</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="bell" color="#fff" size={19} />
          </TouchableOpacity>
        </View>

        {wk ? (
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>Progresso da gravidez</Text>
              <Text style={styles.progressWeeks}>{wk}/40 sem.</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${pct}%` }]} />
            </View>
            <View style={styles.progressStats}>
              {[
                { v: `${wk}ª`, l: 'semana' },
                { v: wk <= 13 ? '1º' : wk <= 26 ? '2º' : '3º', l: 'trimestre' },
                { v: String(40 - wk), l: 'restantes' },
              ].map((item, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <Text style={styles.statVal}>{item.v}</Text>
                  <Text style={styles.statLbl}>{item.l}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyData} onPress={() => navigation.navigate('PersonalData')}>
            <Icon name="edit" color="rgba(255,255,255,0.85)" size={18} />
            <Text style={styles.emptyDataText}>Preencha seus dados pessoais</Text>
            <Icon name="fwd" color="rgba(255,255,255,0.7)" size={16} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        {/* Ações Rápidas */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.grid}>
          {actions.map(a => (
            <TouchableOpacity
              key={a.lb}
              style={styles.card}
              onPress={() => {
                if (a.screen === null) navigation.navigate('Calendario')
                else navigation.navigate(a.screen)
              }}
              activeOpacity={0.8}
            >
              <LinearGradient colors={a.colors} style={styles.cardIcon}>
                <Icon name={a.ic} color="#fff" size={20} />
              </LinearGradient>
              <Text style={styles.cardLabel}>{a.lb}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Próximos Lembretes */}
        {reminders.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Próximos Lembretes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Lembretes')}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {reminders.slice(0, 2).map(r => (
              <View key={r.id} style={styles.listCard}>
                <View style={[styles.dot, { backgroundColor: r.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{r.title}</Text>
                  <Text style={styles.listSub}>{[r.time, fmtDate(r.date)].filter(Boolean).join(' · ')}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Próximos Eventos */}
        {events.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Próximos Eventos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
                <Text style={styles.sectionLink}>Ver calendário</Text>
              </TouchableOpacity>
            </View>
            {events.slice(0, 2).map(e => (
              <View key={e.id} style={styles.listCard}>
                <View style={[styles.dot, { backgroundColor: '#EC407A' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{e.title}</Text>
                  <Text style={styles.listSub}>{[fmtDate(e.date), e.time].filter(Boolean).join(' · ')}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {reminders.length === 0 && events.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Tudo pronto para você!</Text>
            <Text style={styles.emptySub}>Adicione eventos, lembretes e seus dados.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerHello: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22, padding: 14, gap: 8,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.88)' },
  progressWeeks: { fontSize: 11, fontWeight: '900', color: '#fff' },
  progressBg: { height: 9, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 50, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#fff', borderRadius: 50 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: '700' },
  emptyData: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  emptyDataText: { flex: 1, fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  body: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#2D1220', marginBottom: 10, marginTop: 4 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionLink: { fontSize: 11, fontWeight: '800', color: '#EC407A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 22, padding: 16,
    width: '47%', gap: 10,
    shadowColor: '#EC407A', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 12, fontWeight: '900', color: '#2D1220', lineHeight: 16 },
  listCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
    shadowColor: '#EC407A', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  listTitle: { fontSize: 13, fontWeight: '800', color: '#2D1220', marginBottom: 2 },
  listSub: { fontSize: 11, color: '#A07080', fontWeight: '600' },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 22, alignItems: 'center',
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#F5DAE4',
    shadowColor: '#EC407A', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 13, fontWeight: '900', color: '#2D1220', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#A07080', fontWeight: '600' },
})
