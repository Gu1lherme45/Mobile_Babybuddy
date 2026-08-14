import { notifyUnauthorized } from './unauthorizedHandler'

// Só dispara logout automático quando a chamada usava a sessão corrente
// (sem `auth` explícito no config). Login/restauração de sessão passam `auth`
// explícito para *validar* credenciais — um 401 ali é "senha errada", não
// "sessão expirou", e não deve deslogar quem ainda nem está logado.
export function attachUnauthorizedInterceptor(client) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const usouSessaoCorrente = !error.config?.auth
      if (error.response?.status === 401 && usouSessaoCorrente) {
        notifyUnauthorized()
      }
      return Promise.reject(error)
    }
  )
  return client
}
