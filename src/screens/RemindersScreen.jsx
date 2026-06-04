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

const CATS = ['Todos', 'Medicamento', 'Consulta', 'Exame', 'Outro']

export default function RemindersScreen({ navigation }) {
  const { reminders, deleteReminder, toggleReminder, remFilter, setRemFilter } = useApp()
  const filtered = remFilter === 'Todos' ? reminders : reminders.filter(r => r.cat === remFilter)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Lembretes</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('AddReminder')}>
            <Icon name="plus" color="#fff" size={14} />
            <Text style={styles.newBtnText}>Novo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CATS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, remFilter === c && styles.chipActive]}
                onPress={() => setRemFilter(c)}
              >
                <Text style={[styles.chipText, remFilter === c && { color: '#EC407A' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" color="#C9A8B5" size={36} />
            <Text style={styles.emptyTitle}>
              {remFilter !== 'Todos' ? `Nenhum lembrete em "${remFilter}"` : 'Nenhum lembrete'}
            </Text>
            <Text style={styles.emptySub}>Toque em "+ Novo" para criar</Text>
          </View>
        ) : (
          filtered.map(r => (
            <View key={r.id} style={[styles.remItem, { borderLeftColor: r.color, opacity: r.done ? 0.55 : 1 }]}>
              <TouchableOpacity
                style={[styles.checkbox, r.done && { backgroundColor: '#27AE60', borderColor: '#27AE60' }]}
                onPress={() => toggleReminder(r.id)}
              >
                {r.done && <Icon name="check" color="#fff" size={12} />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.remTitle, r.done && { textDecorationLine: 'line-through' }]}>{r.title}</Text>
                <Text style={styles.remMeta}>{[r.time, fmtDate(r.date)].filter(Boolean).join(' · ')}</Text>
                <View style={styles.catTag}>
                  <Text style={styles.catTagText}>{r.cat}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteReminder(r.id)}>
                <Icon name="trash" color="#E53935" size={16} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  newBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#fff' },
  chipText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '900', color: '#A07080' },
  emptySub: { fontSize: 12, color: '#C9A8B5', fontWeight: '600' },
  remItem: {
    backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#F5DAE4',
    alignItems: 'center', justifyContent: 'center',
  },
  remTitle: { fontSize: 13, fontWeight: '800', color: '#2D1220', marginBottom: 2 },
  remMeta: { fontSize: 11, color: '#A07080', fontWeight: '600', marginBottom: 4 },
  catTag: { backgroundColor: '#FFF5F8', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start' },
  catTagText: { fontSize: 10, fontWeight: '800', color: '#EC407A' },
  deleteBtn: { backgroundColor: '#fff0f3', borderRadius: 12, padding: 8 },
})
