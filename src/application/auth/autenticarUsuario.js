import verificarCredenciais from './verificarCredenciais'

export default async function autenticarUsuario(email, password) {
  try {
    return await verificarCredenciais(email, password)
  } catch {
    throw new Error('Usuário ou senha inválidos')
  }
}
