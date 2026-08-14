// Holder em memória das credenciais Basic Auth da sessão atual.
// AppContext é quem chama setCredentials/clearCredentials (login/restauração/logout);
// o authInterceptor só lê, nunca decide quando a sessão muda.
let current = null

export function setCredentials(usuario, senha) {
  current = { username: usuario, password: senha }
}

export function getCredentials() {
  return current
}

export function clearCredentials() {
  current = null
}
