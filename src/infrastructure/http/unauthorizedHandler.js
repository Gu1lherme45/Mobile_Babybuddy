// Registrado pelo AppContext (logout) e disparado pelo apiClient quando uma
// chamada autenticada pela sessão corrente volta 401 — sessão expirada/senha
// trocada em outro dispositivo/conta excluída.
let handler = null

export function setUnauthorizedHandler(fn) {
  handler = fn
}

export function notifyUnauthorized() {
  if (handler) handler()
}
