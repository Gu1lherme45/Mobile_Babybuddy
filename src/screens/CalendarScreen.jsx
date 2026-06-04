import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DS = ['D','S','T','Q','Q','S','S']

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const MIN_YEAR = 2024, MAX_YEAR = 2030

export default function CalendarScreen({ navigation }) {
  const { events, deleteEvent, calMonth, setCalMonth, calYear, setCalYear } = useApp()
  const [calSel, setCalSel] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const m = calMonth, y = calYear
  const fd = new Date(y, m, 1).getDay()
  const dim = new Date(y, m + 1, 0).getDate()
  const atStart = y === MIN_YEAR && m === 0
  const atEnd   = y === MAX_YEAR && m === 11

  function prevMonth() {
    if (atStart) return
    if (m === 0) { setCalYear(y - 1); setCalMonth(11) } else setCalMonth(m - 1)
  }
  function nextMonth() {
    if (atEnd) return
    if (m === 11) { setCalYear(y + 1); setCalMonth(0) } else setCalMonth(m + 1)
  }
  function hasEvent(d) {
    return events.some(e => {
      if (!e.date) return false
      const ed = new Date(e.date)
      return ed.getMonth() === m && ed.getFullYear() === y && ed.getDate() === d
    })
  }
  function selectDay(d) {
    if (calSel === d) { setCalSel(null); setShowAll(false) }
    else { setCalSel(d); setShowAll(false) }
  }

  const dayEvents = calSel
    ? events.filter(e => {
        if (!e.date) return false
        const ed = new Date(e.date)
        return ed.getMonth() === m && ed.getFullYear() === y && ed.getDate() === calSel
      })
    : []
  const shown = showAll ? events : calSel ? dayEvents : null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.navBtn, atStart && { opacity: 0.3 }]}
            onPress={prevMonth} disabled={atStart}
          >
            <Icon name="back" color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[m]} {y}</Text>
          <TouchableOpacity
            style={[styles.navBtn, atEnd && { opacity: 0.3 }]}
            onPress={nextMonth} disabled={atEnd}
          >
            <Icon name="fwd" color="#fff" size={18} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Mini calendário */}
      <View style={styles.calCard}>
        <View style={styles.calGrid}>
          {DS.map((d, i) => <Text key={i} style={styles.dayLabel}>{d}</Text>)}
        </View>
        <View style={styles.calGrid}>
          {Array.from({ length: fd }, (_, i) => <View key={`e${i}`} style={styles.dayCell} />)}
          {Array.from({ length: dim }, (_, i) => {
            const d = i + 1
            const sel = calSel === d
            const dot = hasEvent(d)
            return (
              <TouchableOpacity key={d} style={[styles.dayCell, sel && styles.daySel]} onPress={() => selectDay(d)}>
                <Text style={[styles.dayNum, sel && styles.dayNumSel]}>{d}</Text>
                {dot && <View style={[styles.dotSmall, sel && { backgroundColor: '#fff' }]} />}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.filterBtn, showAll && styles.filterBtnActive]}
          onPress={() => { setCalSel(null); setShowAll(true) }}
        >
          <Text style={[styles.filterBtnText, showAll && { color: '#fff' }]}>
            {calSel ? `Dia ${calSel}` : 'Todos os Eventos'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEvent')}>
          <Icon name="plus" color="#fff" size={14} />
          <Text style={styles.addBtnText}>Evento</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        {shown === null ? (
          <View style={styles.hint}>
            <Text style={styles.hintTitle}>Selecione um dia</Text>
            <Text style={styles.hintSub}>ou toque em "Todos os Eventos"</Text>
          </View>
        ) : shown.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="cal" color="#C9A8B5" size={36} />
            <Text style={styles.emptyTitle}>Nenhum evento</Text>
            <Text style={styles.emptySub}>Toque em "+ Evento" para adicionar</Text>
          </View>
        ) : (
          shown.map(e => (
            <View key={e.id} style={styles.eventCard}>
              <View style={styles.eventTop}>
                <View style={styles.eventDot} />
                <Text style={styles.eventTitle}>{e.title}</Text>
              </View>
              <Text style={styles.eventMeta}>
                {[fmtDate(e.date), e.time].filter(Boolean).join(' · ')}{e.local ? ` · ${e.local}` : ''}
              </Text>
              {!!e.notes && <Text style={styles.eventNotes}>{e.notes}</Text>}
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteEvent(e.id)}>
                <Icon name="trash" color="#E53935" size={13} />
                <Text style={styles.deleteBtnText}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  monthTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  calCard: {
    backgroundColor: '#fff', margin: 14, borderRadius: 24, padding: 14,
    shadowColor: '#EC407A', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayLabel: { width: '14.28%', textAlign: 'center', fontSize: 10, color: '#A07080', fontWeight: '900', paddingVertical: 4 },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
  daySel: { backgroundColor: '#EC407A', borderRadius: 20 },
  dayNum: { fontSize: 13, color: '#2D1220', fontWeight: '600' },
  dayNumSel: { color: '#fff', fontWeight: '900' },
  dotSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#EC407A', marginTop: 2 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, marginBottom: 8 },
  filterBtn: {
    borderRadius: 50, borderWidth: 1.5, borderColor: '#F5DAE4',
    paddingHorizontal: 14, paddingVertical: 6,
  },
  filterBtnActive: { backgroundColor: '#EC407A', borderColor: '#EC407A' },
  filterBtnText: { fontSize: 12, fontWeight: '900', color: '#EC407A' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EC407A', borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  hint: { alignItems: 'center', padding: 28 },
  hintTitle: { fontSize: 13, fontWeight: '800', color: '#A07080', marginBottom: 4 },
  hintSub: { fontSize: 11, fontWeight: '600', color: '#C9A8B5' },
  empty: { alignItems: 'center', padding: 28, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '900', color: '#A07080' },
  emptySub: { fontSize: 12, color: '#C9A8B5', fontWeight: '600' },
  eventCard: {
    backgroundColor: '#fff', borderRadius: 22, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#EC407A',
    shadowColor: '#EC407A', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  eventTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EC407A' },
  eventTitle: { fontSize: 13, fontWeight: '900', color: '#2D1220', flex: 1 },
  eventMeta: { fontSize: 11, color: '#A07080', fontWeight: '700', marginBottom: 4 },
  eventNotes: { fontSize: 12, color: '#7A5060', fontWeight: '600', lineHeight: 18, marginBottom: 8 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff0f3', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  deleteBtnText: { fontSize: 11, fontWeight: '900', color: '#E53935' },
})
