import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Wrapper: no browser usa localStorage, no celular usa SecureStore (expo-secure-store)
const SecureStorage = {
  async getItem(key) {
    if (Platform.OS === 'web') return localStorage.getItem(key)
    return await SecureStore.getItemAsync(key)
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return }
    await SecureStore.setItemAsync(key, value)
  },
  async deleteItem(key) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return }
    await SecureStore.deleteItemAsync(key)
  },
}

export default SecureStorage
