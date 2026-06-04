import { Platform } from 'react-native'

// Web (navegador no computador) → localhost
// Celular físico via Expo Go → troca pelo IP do seu computador na rede da escola
//   Para descobrir o IP: abra o terminal e digite "ipconfig"
//   Procure "Endereço IPv4" (ex: 192.168.1.105)

const IP_COMPUTADOR = '10.0.2.2' // '10.0.2.2' para emulador ou o IP do Wi-Fi para celular real

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : `http://${IP_COMPUTADOR}:8080`
