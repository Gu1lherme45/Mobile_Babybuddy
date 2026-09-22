import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../components/Icon'
import { listarMateriais } from '../application/material'

export default function MaterialsScreen({ navigation }) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try { setMaterials(await listarMateriais()) }
    catch (_) { setError('Não foi possível carregar os artigos. Verifique sua conexão.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  return <SafeAreaView style={styles.safe}>
    <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Voltar"><Icon name="back" color="#fff" size={22} /></TouchableOpacity>
      <View style={styles.headerCopy}><Text style={styles.eyebrow}>CONTEÚDO CONFIÁVEL</Text><Text style={styles.title}>Artigos BabyBuddy</Text>
        <Text style={styles.subtitle}>Informação para acompanhar cada fase com mais segurança.</Text></View>
    </LinearGradient>
    {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#EC407A" /><Text style={styles.stateText}>Carregando artigos...</Text></View>
      : <FlatList data={materials} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#EC407A" />}
        ListHeaderComponent={error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        ListEmptyComponent={<View style={styles.empty}><Icon name="file" color="#C9A8B5" size={34} /><Text style={styles.emptyTitle}>Nenhum artigo disponível</Text>
          <Text style={styles.stateText}>Novos conteúdos aparecerão aqui quando forem publicados.</Text></View>}
        renderItem={({ item }) => <TouchableOpacity style={styles.card} activeOpacity={0.82}
          onPress={() => navigation.navigate('MaterialDetail', { materialId: item.id })} accessibilityRole="button">
          {item.coverUrl ? <Image source={{ uri: item.coverUrl }} style={styles.cover} accessibilityLabel={`Capa de ${item.title}`} />
            : <View style={[styles.cover, styles.placeholder]}><Icon name="file" color="#EC407A" size={34} /></View>}
          <View style={styles.cardBody}><Text style={styles.category}>{item.category.toUpperCase()}</Text><Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text><View style={styles.readRow}><Text style={styles.author}>{item.author}</Text>
              <View style={styles.read}><Text style={styles.readText}>Ler</Text><Icon name="fwd" color="#EC407A" size={14} /></View></View></View>
        </TouchableOpacity>} />}
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F0F5' }, header: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24, flexDirection: 'row', gap: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 }, eyebrow: { color: 'rgba(255,255,255,.75)', fontWeight: '900', fontSize: 10, letterSpacing: 1.1 }, title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,.82)', fontSize: 12, lineHeight: 17, marginTop: 4 }, list: { padding: 16, paddingBottom: 30, gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', shadowColor: '#6F2345', shadowOpacity: .1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  cover: { width: '100%', height: 190, backgroundColor: '#FFF5F8' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, cardBody: { padding: 16 },
  category: { color: '#EC407A', fontSize: 10, fontWeight: '900', letterSpacing: .8 }, cardTitle: { color: '#2D1220', fontSize: 18, fontWeight: '900', marginTop: 7 },
  description: { color: '#7D5A69', fontSize: 12, lineHeight: 18, marginTop: 7 }, readRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  author: { color: '#A07080', fontSize: 11, fontWeight: '700' }, read: { flexDirection: 'row', alignItems: 'center', gap: 4 }, readText: { color: '#EC407A', fontSize: 12, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }, stateText: { color: '#8A6575', textAlign: 'center', fontSize: 12, lineHeight: 18 },
  error: { color: '#B42318', backgroundColor: '#FEF3F2', padding: 12, borderRadius: 14 }, empty: { alignItems: 'center', gap: 8, padding: 34, backgroundColor: '#fff', borderRadius: 22 },
  emptyTitle: { color: '#2D1220', fontSize: 15, fontWeight: '900' },
})
