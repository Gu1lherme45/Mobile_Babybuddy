import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={[styles.menuItem, danger && styles.menuItemDanger]} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Icon name={icon} color={danger ? '#E53935' : '#EC407A'} size={18} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Icon name="fwd" color={danger ? '#E53935' : '#C9A8B5'} size={16} />
    </TouchableOpacity>
  )
}

export default function ProfileScreen({ navigation }) {
  const { currentUser, logout } = useApp()

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F0F5' }}>
      <LinearGradient colors={['#EC407A', '#C0255B']} style={styles.header}>
        <View style={styles.avatarWrap}>
          <Icon name="user" color="#fff" size={38} />
        </View>
        <Text style={styles.userName}>{currentUser?.nome || 'Usuária'}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || ''}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.section}>MINHA CONTA</Text>
        <MenuItem icon="edit"   label="Dados Pessoais"     onPress={() => navigation.navigate('PersonalData')} />
        <MenuItem icon="shield" label="Alterar Senha"      onPress={() => navigation.navigate('ChangePassword')} />

        <Text style={styles.section}>INFORMAÇÕES</Text>
        <MenuItem icon="file"   label="Política de Privacidade" onPress={() => navigation.navigate('Privacy')} />
        <MenuItem icon="check"  label="Termos de Uso"           onPress={() => navigation.navigate('Terms')} />

        <Text style={styles.section}>SESSÃO</Text>
        <MenuItem icon="logout" label="Sair"               onPress={handleLogout} />
        <MenuItem icon="trash"  label="Excluir Conta"      onPress={() => navigation.navigate('DeleteAccount')} danger />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  avatarWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  userName:  { fontSize: 18, fontWeight: '900', color: '#fff' },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  body: { padding: 16, paddingBottom: 30 },
  section: { fontSize: 10, fontWeight: '900', color: '#A07080', letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingLeft: 4 },
  menuItem: {
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    shadowColor: '#EC407A', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  menuItemDanger: { backgroundColor: '#fff5f5' },
  menuIcon: {
    width: 38, height: 38, borderRadius: 14,
    backgroundColor: '#FFF5F8', alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#fff0f3' },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '800', color: '#2D1220' },
  menuLabelDanger: { color: '#E53935' },
})
