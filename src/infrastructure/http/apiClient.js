import axios from 'axios'
import { API_URL, API_URLS, setApiUrl, initializeApiUrls } from '../../config'
import { attachAuthInterceptor } from './authInterceptor'
import { attachUnauthorizedInterceptor } from './unauthorizedInterceptor'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const expoExtra = globalThis.expo?.modules?.ExpoConstants?.manifest?.extra
  || globalThis.expo?.modules?.ExpoConstants?.expoConfig?.extra
  || globalThis.__expo_config?.extra
if (Array.isArray(expoExtra?.apiHostIps) && !process.env.EXPO_PUBLIC_API_URL) {
  initializeApiUrls(expoExtra.apiHostIps)
}

let fallbackPromise

apiClient.interceptors.response.use(undefined, async (error) => {
  const request = error.config
  const currentBaseUrl = request?.baseURL || apiClient.defaults.baseURL
  const isNetworkFailure = !error.response && error.code !== 'ERR_CANCELED'
  const remainingUrls = API_URLS.filter((url) => url !== currentBaseUrl)

  if (!request || !isNetworkFailure || remainingUrls.length === 0 || request._triedHostIps) {
    return Promise.reject(error)
  }

  request._triedHostIps = true
  if (!fallbackPromise) {
    fallbackPromise = (async () => {
      for (const url of remainingUrls) {
        try {
          await apiClient.get('/api/materiais', { baseURL: url, _skipHostFallback: true })
          setApiUrl(url)
          apiClient.defaults.baseURL = url
          return url
        } catch (probeError) {
          if (probeError.response || probeError.code === 'ERR_CANCELED') throw probeError
        }
      }
      throw error
    })().finally(() => { fallbackPromise = null })
  }

  try {
    const baseURL = await fallbackPromise
    request.baseURL = baseURL
    return apiClient.request(request)
  } catch (_) {
    return Promise.reject(error)
  }
})

attachAuthInterceptor(apiClient)
attachUnauthorizedInterceptor(apiClient)

export default apiClient
