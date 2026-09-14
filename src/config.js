import { Platform } from 'react-native'

const DEFAULT_API_URL_BY_PLATFORM = {
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  web: 'http://localhost:8080',
}

export function resolveApiUrl(
  platform = Platform.OS,
  configuredUrl = process.env.EXPO_PUBLIC_API_URL
) {
  const apiUrl = configuredUrl?.trim() || DEFAULT_API_URL_BY_PLATFORM[platform]

  if (!apiUrl) {
    throw new Error(`Não existe uma URL padrão da API para a plataforma "${platform}".`)
  }

  if (!/^https?:\/\//i.test(apiUrl)) {
    throw new Error('EXPO_PUBLIC_API_URL deve começar com http:// ou https://.')
  }

  return apiUrl.replace(/\/+$/, '')
}

export const API_URL = resolveApiUrl()
