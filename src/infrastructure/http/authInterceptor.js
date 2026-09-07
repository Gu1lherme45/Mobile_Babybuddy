import { getCredentials } from './credentialsStore'

// Aplica Basic Auth (axios `auth`, gera o header Authorization sozinho) usando a
// sessão atual. Chamadas que já passam `auth` explícito (ex.: verificar credenciais
// no login, antes de existir sessão) não são sobrescritas.
export function attachAuthInterceptor(client) {
  client.interceptors.request.use((config) => {
    if (!config.auth) {
      const creds = getCredentials()
      if (creds) config.auth = creds
    }
    return config
  })
  return client
}
