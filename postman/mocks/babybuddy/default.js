// Contrato: entidades/controllers Gestante e Questionario do Backend_Babybuddy
// e payload de Web_Babybuddy/src/pages/Questionario/Questionario.jsx.
// Dados exclusivamente fictícios. /__test/* controla somente esta simulação local.
const http = require('http')

http.createServer(async (req, res) => {
  const path = req.url.split('?')[0]
  const method = req.method
  const body = req.body || {}
  const send = (status, data) => {
    res.writeHead(status, {
      'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mock-session',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    })
    res.end(JSON.stringify(data))
  }
  if (method === 'OPTIONS') return send(200, {})
  if (path === '/__test/reset' && method === 'POST') {
    await pm.state.set('babybuddy.data', { gestantes: body.gestantes || [], questionarios: body.questionarios || [], users: [], failure: null, requests: [] })
    return send(200, { ok: true })
  }
  const state = await pm.state.get('babybuddy.data') || { gestantes: [], questionarios: [], users: [], failure: null, requests: [] }
  if (path === '/__test/state') return send(200, state)
  if (path === '/__test/fail' && method === 'POST') {
    state.failure = body
    await pm.state.set('babybuddy.data', state)
    return send(200, { ok: true })
  }
  state.requests.push({ method, path })
  if (state.failure?.path === path && state.failure.method === method) {
    const status = state.failure.status || 503
    state.failure = null
    await pm.state.set('babybuddy.data', state)
    return send(status, { error: 'Falha temporária simulada' })
  }
  const save = async (data, status = 200) => {
    await pm.state.set('babybuddy.data', state)
    return send(status, data)
  }
  if (path === '/api/usuarios' && method === 'POST') {
    if (state.users.some(user => user.username === body.username)) return save({ error: 'E-mail já cadastrado' }, 409)
    const user = { id: state.users.length + 7, nome: body.nome, username: body.username, nivelAcesso: 'Gestante' }
    state.users.push(user)
    return save(user)
  }
  if (!req.headers.authorization?.startsWith('Basic ')) return save({ error: 'Não autenticado' }, 401)
  if (path === '/api/usuarios/me' && method === 'GET') {
    const username = Buffer.from(req.headers.authorization.slice(6), 'base64').toString().split(':')[0]
    return save(state.users.find(user => user.username === username) || { id: 7, nome: 'Usuária de teste', username, nivelAcesso: 'Gestante' })
  }
  if (path === '/api/gestantes' && method === 'GET') return save(state.gestantes)
  if (path === '/api/gestantes' && method === 'POST') {
    if (!body.usuario?.id || !body.dataNascimento || !body.tipoSanguineo || typeof body.observacoes !== 'string') return save({ error: 'Gestante inválida' }, 400)
    const item = { ...body, id: Math.max(0, ...state.gestantes.map(g => g.id)) + 1, dataRegistro: new Date().toISOString() }
    state.gestantes.push(item)
    return save(item)
  }
  const gestanteMatch = path.match(/^\/api\/gestantes\/(\d+)$/)
  if (gestanteMatch && method === 'PUT') {
    const item = state.gestantes.find(g => g.id === Number(gestanteMatch[1]))
    if (!item) return save({}, 404)
    Object.assign(item, body, { id: item.id })
    return save(item)
  }
  const listMatch = path.match(/^\/api\/questionarios\/gestante\/(\d+)$/)
  if (listMatch && method === 'GET') return save(state.questionarios.filter(q => q.gestante.id === Number(listMatch[1])))
  const updateMatch = path.match(/^\/api\/questionarios\/(\d+)$/)
  if ((path === '/api/questionarios' && method === 'POST') || (updateMatch && method === 'PUT')) {
    if (!['sim', 'nao'].includes(body.primeiraGestacao) || !['sim', 'nao'].includes(body.possuiAlergia)
      || !['Nao', 'Hipertensao', 'Diabetes gestacional', 'Anemia', 'Outra'].includes(body.condicaoSaude)
      || !['Sim', 'Nao', 'Ainda nao iniciei'].includes(body.prenatalRegular)
      || !Number.isInteger(body.semanaGestacional) || body.semanaGestacional < 1 || body.semanaGestacional > 42
      || !body.gestante?.id || body.aceiteTermos !== true) return save({ error: 'Questionário inválido' }, 400)
    if (updateMatch) {
      const item = state.questionarios.find(q => q.id === Number(updateMatch[1]))
      if (!item) return save({}, 404)
      Object.assign(item, body, { id: item.id })
      return save(item)
    }
    const item = { ...body, id: Math.max(0, ...state.questionarios.map(q => q.id)) + 1, dataPreenchimento: new Date().toISOString() }
    state.questionarios.push(item)
    return save(item)
  }
  return save({ error: 'Endpoint não modelado nesta simulação' }, 501)
}).listen(process.env.PORT || 4901)
