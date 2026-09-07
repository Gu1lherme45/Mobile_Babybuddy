import verificarCredenciais from './verificarCredenciais'

// Usado na restauração de sessão no boot do app: valida as credenciais
// salvas no SecureStorage sem trocar a mensagem de erro para "login inválido"
// (quem decide o que fazer com a falha é o AppContext, silenciosamente).
export default function obterUsuarioAtual(email, password) {
  return verificarCredenciais(email, password)
}
