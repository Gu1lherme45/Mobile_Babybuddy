import { Platform } from 'react-native'

function normalizeApiUrl(value) {
  const url = value?.trim()
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('EXPO_PUBLIC_API_URL deve começar com http:// ou https://.')
  }
  return url.replace(/\/+$/, '')
}

export function resolveApiUrls(
  platform = Platform.OS,
  configuredUrl = process.env.EXPO_PUBLIC_API_URL,
  hostIps = process.env.EXPO_PUBLIC_API_HOST_IPS
) {
  const explicitUrl = normalizeApiUrl(configuredUrl)
  if (explicitUrl) return [explicitUrl]

  const urls = []
  if (platform === 'android') urls.push('http://10.0.2.2:8080')
  if (platform === 'ios' || platform === 'web') urls.push('http://localhost:8080')

  for (const ip of (hostIps || '').split(',')) {
    const address = ip.trim()
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(address)) urls.push(`http://${address}:8080`)
  }

  return [...new Set(urls)]
}

export function resolveApiUrl(
  platform = Platform.OS,
  configuredUrl = process.env.EXPO_PUBLIC_API_URL,
  hostIps = process.env.EXPO_PUBLIC_API_HOST_IPS
) {
  const [apiUrl] = resolveApiUrls(platform, configuredUrl, hostIps)
  if (!apiUrl) throw new Error(`Não existe uma URL padrão da API para a plataforma "${platform}".`)
  return apiUrl
}

export const API_URLS = resolveApiUrls(Platform.OS, process.env.EXPO_PUBLIC_API_URL)
export const API_URL = API_URLS[0]

export function initializeApiUrls(hostIps = [], configuredUrl = '') {
  const urls = resolveApiUrls(Platform.OS, configuredUrl, hostIps.join(','))
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    for (const url of urls) if (!API_URLS.includes(url)) API_URLS.push(url)
  } else {
    API_URLS.splice(0, API_URLS.length, ...urls)
  }
  return urls
}

export function setApiUrl(url) {
  const normalizedUrl = normalizeApiUrl(url)
  if (!normalizedUrl) throw new Error('A URL do backend está vazia.')
  if (API_URLS.includes(normalizedUrl)) return
  API_URLS.push(normalizedUrl)
}
