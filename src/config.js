import { Platform } from 'react-native'

// Web (navegador no computador) → localhost
// Celular físico via Expo Go → troca pelo IP do seu computador na rede da escola
//   Para descobrir o IP: abra o terminal e digite "ipconfig"
//   Procure "Endereço IPv4" (ex: 192.168.1.105)
const MEU_IP = '192.168.0.115'

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : `http://${MEU_IP}:8080`
