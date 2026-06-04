import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

export default function DeleteAccountScreen({ navigation }) {
  const { deleteCurrentAccount } = useApp()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleDelete() {
    if (!confirmed) { setConfirmed(true); return }
    setLoading(true)
    try {
      await deleteCurrentAccount()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" color="#fff" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Excluir Conta</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.warnIcon}>
          <Icon name="warn" color="#E53935" size={48} />
        </View>

        <Text style={styles.title}>Tem certeza?</Text>
        <Text style={styles.desc}>
          Esta ação é irreversível. Todos os seus dados, lembretes e eventos serão
          permanentemente excluídos.
        </Text>

        {confirmed && (
          <View style={styles.confirmBox}>
            <Icon name="warn" color="#E53935" size={16} />
            <Text style={styles.confirmText}>
              Confirme novamente para excluir definitivamente.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.deleteBtn, loading && { backgroundColor: '#FFB7CD' }]}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Icon name="trash" color="#fff" size={18} />
                <Text style={styles.deleteBtnText}>
                  {confirmed ? 'Confirmar exclusão' : 'Excluir minha conta'}
                </Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
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
  body: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 16 },
  warnIcon: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#fff0f3', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#2D1220' },
  desc: { fontSize: 13, color: '#A07080', fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  confirmBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: '#fff0f3', borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: '#FFB7CD', alignSelf: 'stretch',
  },
  confirmText: { flex: 1, fontSize: 12, color: '#E53935', fontWeight: '700' },
  deleteBtn: {
    backgroundColor: '#E53935', borderRadius: 50,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'stretch',
  },
  deleteBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  cancelBtn: {
    borderRadius: 50, borderWidth: 1.5, borderColor: '#F5DAE4',
    paddingVertical: 13, alignItems: 'center', alignSelf: 'stretch',
  },
  cancelBtnText: { color: '#EC407A', fontSize: 13, fontWeight: '800' },
})
