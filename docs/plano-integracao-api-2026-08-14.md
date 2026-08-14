# Prompt de Execução — Integração Mobile × Backend BabyBuddy

> Este documento é o prompt de execução passo a passo para conectar as telas já existentes do `Mobile_Babybuddy` (Expo/React Native) às rotas reais do backend (`Backend_Babybuddy`, `http://localhost:8080` — ver `Backend_Babybuddy/docs/api-rotas.md`). Segue a mesma filosofia e o mesmo nível de rigor do plano já executado em `Web_Babybuddy/docs/plano-integracao-api-2026-08-13.md`, adaptado para as particularidades de Mobile First / Native / Expo. Cada Sprint é executada e entregue de forma independente, na ordem apresentada, e só é considerada concluída quando o checklist de "não fazer" e os testes da sprint estiverem 100% verdes.
>
> **Antes de escrever qualquer código:** ler a documentação versionada do Expo em uso neste projeto — `https://docs.expo.dev/versions/v56.0.0/` (Expo mudou; ver `AGENTS.md`) — para confirmar APIs (SecureStore, AsyncStorage, NetInfo, etc.) antes de usá-las.

## Diagnóstico do estado atual (2026-08-14)

O app já fala com o backend, mas de forma monolítica e sem camadas:

- `src/context/AppContext.jsx` concentra autenticação (`login`, `register`, `logout`, `deleteCurrentAccount`, `changePassword`) usando `fetch` cru + Basic Auth manual (`basicAuth()`/`apiFetch()`), sem `axios`, sem repositórios, sem casos de uso isolados.
- `profile` (dados pessoais), `reminders` (lembretes) e `events` (eventos) são **100% locais** (`AsyncStorage`), sem nenhuma persistência no backend, apesar de o backend já ter `Gestante`, `Agenda`, `Evento` e `Questionario` prontos para isso.
- Credenciais (`email`/`password`) já ficam em `expo-secure-store` no nativo (com fallback `localStorage` só no `Platform.OS === 'web'`) — **esse padrão está correto e deve ser preservado**, é o equivalente mobile ao HTTP Basic recomendado pelo backend para CLI/scripts.
- Não existe `axios` nas dependências, nem `domain/`, `application/` ou `infrastructure/`, nem stack de testes.
- Não há tela de Materiais/Artigos, Favoritos, Suporte ou Administrador no mobile hoje — logo essas integrações **não fazem parte deste plano** (ver Backlog).

## Regras não negociáveis (valem para TODAS as sprints, sem exceção)

1. **Não alterar layout.** Estrutura visual, `StyleSheet`, hierarquia de componentes e comportamento de UI das telas existentes permanecem exatamente como estão.
2. **Não alterar estilos.** Nenhum objeto `StyleSheet.create` é tocado em nenhuma sprint.
3. **Não alterar o que já funciona.** Nenhum fluxo hoje operante (mesmo que só local/`AsyncStorage`) pode regredir. Se um campo não tem correspondência no backend e a sprint não cobre isso, ele continua local.
4. **Alteração é sempre aditiva.** A API é plugada dentro da lógica que já existe (`AppContext`, handlers de tela) — sem reescrever componentes, sem novas libs de UI, sem trocar navegação.
5. **Clean Code + DDD + SOLID.** Separar `domain/` (entidades/tipos), `application/` (casos de uso) e `infrastructure/` (`axios`, repositórios, storage) da camada de apresentação (`screens/`, `context/AppContext.jsx` vira um adaptador fino que delega para `application/`).
6. **Nenhuma credencial em texto puro fora do `expo-secure-store`/`SecureStorage` já existente.** `AsyncStorage` nunca guarda senha ou token — só dados de app (perfil, lembretes, metadados locais).
7. **Toda função nova em `application/` e `infrastructure/` tem teste unitário.** Ver stack de testes abaixo.
8. **Mobile First / Native / Expo:** qualquer API nova usada (armazenamento, rede, notificações) deve ser conferida contra `https://docs.expo.dev/versions/v56.0.0/` antes de usar — a versão do Expo já mudou uma vez neste projeto.

## Stack de testes (a ser adicionada — o projeto hoje não tem nenhuma)

- **Unitário/integração:** `jest` + preset `react-native` (o preset oficial embutido no pacote `react-native` já instalado) + `@testing-library/react-native` — cobre `domain/`, `application/`, `infrastructure/` com `axios` mockado (`jest.mock(...)`).
  > **Ajuste feito durante a execução da Sprint 0:** o plano original previa `jest-expo`, mas esse preset quebra neste projeto (`TypeError: Object.defineProperty called on non-object` em `jest-expo/src/preset/setup.js`) porque as dependências do projeto estão desalinhadas da versão do `expo` instalada — `npx expo install --check` mostra `react-native@0.77.1` pinado enquanto `expo@54.0.35` já espera `0.81.5` (e o mesmo vale para `react`, `react-dom`, `expo-secure-store`, `expo-status-bar`, `expo-linear-gradient`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `react-native-web`). Isso é uma divergência pré-existente do projeto, não introduzida por este plano — **registrado como decisão separada, fora deste escopo** (ver nota abaixo). O preset `react-native` (mais simples, sem o mock extra de módulos nativos do Expo que estava causando o crash) resolve para testar `domain/`/`application/`/`infrastructure/`, que são JS puro e não dependem desses módulos nativos.
- **E2E on-device (Detox/Maestro):** fica **fora do escopo obrigatório** deste plano — setup pesado (build nativo) para o tamanho do projeto. Registrado no Backlog como item opcional a avaliar depois do MVP funcional.
- Script novo em `package.json`: `test` (`jest`). Nenhum script existente (`start`, `android`, `ios`, `web`) é alterado.

> **Nota separada (fora do escopo deste plano de integração):** o projeto tem pacotes significativamente desatualizados em relação à sua própria versão do `expo` instalada (ver `npx expo install --check`). Corrigir isso é um upgrade maior (React 18→19, React Native 0.77→0.81, várias libs nativas) que pode alterar comportamento de runtime e não tem relação com conectar o app ao backend — decisão a ser tomada separadamente pelo time, não incluída nestas sprints.

## Arquitetura alvo (DDD-lite, 100% aditiva — espelha o padrão já validado no Web)

```
src/
  domain/                      # entidades por contexto: Usuario, Gestante, Compromisso (Agenda)...
  application/
    auth/                      # autenticarUsuario, cadastrarUsuario, trocarSenha, excluirConta, obterUsuarioAtual
    gestante/                  # registrarOuAtualizarGestante
    agenda/                    # registrarCompromisso, listarCompromissos, removerCompromisso
  infrastructure/
    http/apiClient.js          # instância axios única (baseURL = API_URL de src/config.js)
    http/authInterceptor.js    # injeta "Authorization: Basic <base64>" a partir das credenciais salvas
    storage/SecureStorage.js   # wrapper hoje embutido no AppContext, extraído para cá
    repositories/              # UsuarioRepository, GestanteRepository, AgendaRepository
  context/AppContext.jsx       # EXISTENTE — vira fino: chama application/*, mantém a mesma API pública (useApp())
  screens/ ...                 # EXISTENTE, INTOCADO visualmente
```

**Decisão de arquitetura — por que Basic Auth por requisição, não `withCredentials`/cookie de sessão:**
O plano do Web usa `axios` com `withCredentials: true` (cookie de sessão via `POST /login`), porque roda em navegador. Em React Native não há cookie jar automático confiável entre requisições `axios`/`fetch`. O padrão já em uso no `AppContext` (Basic Auth por request, credenciais persistidas no `SecureStore`) é o caminho correto para mobile — é literalmente o que `Backend_Babybuddy/docs/api-rotas.md` recomenda para clientes não-browser. Manter esse padrão, só migrando de `fetch` cru para `axios` + interceptor.

---

## Sprint 0 — Fundação técnica (nenhuma tela tocada)

**Objetivo:** preparar `apiClient`, camada de auth e infraestrutura de testes para que as sprints seguintes só precisem plugar casos de uso no `AppContext`.

**Execute:**
1. Adicionar `axios` às dependências (`Backend_Babybuddy` já é consumido via `axios` no Web; manter consistência entre os três projetos).
2. Configurar `jest-expo` + `@testing-library/react-native` (dependências, config, script `test`).
3. Extrair o wrapper `SecureStorage` (hoje inline em `AppContext.jsx`) para `src/infrastructure/storage/SecureStorage.js`, sem mudar comportamento (web → `localStorage`, nativo → `expo-secure-store`).
4. Criar `src/infrastructure/http/apiClient.js`: `axios.create({ baseURL: API_URL })` (reaproveita `src/config.js`, que já resolve `localhost` vs. IP da rede por `Platform.OS`).
5. Criar `src/infrastructure/http/authInterceptor.js`: interceptor de request que lê as credenciais atuais (via um pequeno *credentials holder*, não direto do `SecureStorage` a cada chamada) e injeta `Authorization: Basic <base64(username:password)>` quando existirem; ausência de credenciais → requisição segue sem header (rotas públicas).
6. Criar repositórios crus mapeando `api-rotas.md`: `UsuarioRepository` (`criar`, `buscarMe`, `atualizar`, `trocarSenha`, `remover`), `GestanteRepository` (`criar`, `atualizar`, `buscarPorId`), `AgendaRepository` (`criar`, `listar`, `atualizar`, `remover`, `cancelar`).
7. Criar `src/application/auth/`: `autenticarUsuario`, `cadastrarUsuario`, `trocarSenha`, `excluirConta`, `obterUsuarioAtual` — extraindo a lógica hoje dentro de `login`/`register`/`changePassword`/`deleteCurrentAccount` do `AppContext`, agora usando `apiClient`/`UsuarioRepository`.

**Testes desta sprint:**
- Unitários: `apiClient`/interceptor (header Basic presente/ausente), cada repository (`axios` mockado), cada caso de uso de `application/auth` (sucesso e erro).
- E2E: nenhum ainda.

**Definição de pronto:** suíte unitária 100% verde; `git diff` não toca em nenhum arquivo de `src/screens` ou nos `StyleSheet.create` de `src/context/AppContext.jsx`; `AppContext` ainda expõe exatamente as mesmas chaves em `useApp()` (nenhuma tela quebra).

---

## Sprint 1 — Autenticação (validação ponta a ponta)

**Objetivo:** confirmar que `LoginScreen`/`RegisterScreen`/`ProfileScreen` (logout)/`DeleteAccountScreen`/`ChangePasswordScreen` continuam funcionando 100% através da nova camada `application/auth`, sem tocar nas telas — elas já chamam só `useApp().login/register/logout/...`, então o trabalho é inteiramente por baixo do capô no `AppContext.jsx`.

**Execute:**
1. `AppContext.login` → delega para `application/auth/autenticarUsuario`.
2. `AppContext.register` → delega para `application/auth/cadastrarUsuario` + login automático (comportamento atual preservado).
3. `AppContext.changePassword` → delega para `application/auth/trocarSenha`.
4. `AppContext.deleteCurrentAccount` → delega para `application/auth/excluirConta`.
5. Restauração de sessão no boot (`useEffect` que lê `SecureStore` e chama `GET /api/usuarios/me`) → delega para `application/auth/obterUsuarioAtual`.
6. Padronizar tratamento de erro: 401 em qualquer chamada autenticada limpa a sessão local automaticamente (hoje só acontece no boot; comportamento aditivo, não muda UI).

**Testes desta sprint:**
- Unitários: os 5 pontos acima no `AppContext` (mockando `application/auth`).
- Manual/E2E: cadastro → login → fechar e reabrir o app (sessão restaurada) → trocar senha → logar de novo com a senha nova → excluir conta.

**Definição de pronto:** login/cadastro/logout/troca de senha/exclusão de conta reais contra `localhost:8080` (ou IP configurado em `src/config.js`); zero `fetch` cru restante no projeto para esses fluxos; nenhuma tela alterada.

---

## Sprint 2 — Dados Pessoais → Gestante

**Objetivo:** persistir no backend os campos de `PersonalDataScreen` que têm correspondência real em `Gestante`; manter local (`AsyncStorage`, como hoje) os que não têm.

**Mapeamento (`PersonalDataScreen` → `Gestante`, ver `api-rotas.md`):**

| Campo da tela | Destino |
|---|---|
| `blood` (Tipo Sanguíneo) | `Gestante.tipoSanguineo` |
| `doctor`, `hospital`, `weight`, `height`, `allergies` | **sem campo correspondente** — permanecem só locais (`AsyncStorage`), igual ao tratamento dado no Web a campos sem contrato no backend |
| `weeks` (semanas), `due` (data prevista) | pertencem semanticamente a `Questionario` (`semanaGestacional`, `dataPrevistaParto`), não a `Gestante` — ver bloqueio abaixo |

> **Bloqueio conhecido #1 — RESOLVIDO (decisão do usuário, 2026-08-14):** confirmado no código (`Gestante.java`) que `dataNascimento` **e** `observacoes` são `nullable = false`. Decisão tomada: adicionar um campo "Data de Nascimento" em `PersonalDataScreen` (mudança aditiva de UI — um novo item no array `FIELDS`, sem tocar `StyleSheet`) e sintetizar `observacoes` a partir de `doctor`/`hospital`/`weight`/`height`/`allergies` (nenhum tem coluna própria em `Gestante`). Implementado em `src/domain/gestante/Gestante.js` (`toPayload`/`fromDTO`) e `src/application/gestante/*`; validado contra o backend real (`POST`/`PUT /api/gestantes`).
>
> **Bloqueio conhecido #2:** `weeks`/`due` pertencem ao domínio de `Questionario`, que exige também `idade`, `primeiraGestacao`, `condicaoSaude`, `prenatalRegular`, `possuiAlergia`, `aceiteTermos` — nenhum coletado hoje no mobile. Plugar `Questionario` de verdade fica em Backlog (mesma trava que o Web documentou para `Gestação`, e adicionalmente aqui falta a própria tela).

**Execute (escopo real desta sprint, dado os bloqueios acima):**
1. `src/application/gestante/registrarOuAtualizarGestante(dados)` — cria `Gestante` na primeira vez (se e somente se o backend confirmar que `dataNascimento` pode ser omitido/nulo) ou, na ausência dessa confirmação, deixar a função pronta e coberta por teste, mas **não conectada ao handler da tela** até o bloqueio ser resolvido (registrar isso explicitamente no PR da sprint).
2. `PersonalDataScreen`: ao montar, se existir `Gestante` vinculada ao usuário, buscar via `GestanteRepository.buscarPorId`/rota equivalente e prencher `tipoSanguineo` a partir dela; os demais campos continuam vindo do `AsyncStorage` local, exatamente como hoje.
3. `handleSave` continua chamando `setProfile(form)` (local) — **adicionalmente**, se o campo `blood` mudou e a integração estiver liberada (bloqueio #1 resolvido), dispara `registrarOuAtualizarGestante`.

**Testes desta sprint:**
- Unitários: mapeamento de payload, `registrarOuAtualizarGestante` (sucesso e erro), `GestanteRepository`.
- Manual: salvar tipo sanguíneo e confirmar persistência real via `GET /api/gestantes/{id}` (assim que o bloqueio #1 for destravado).

**Definição de pronto:** campos com contrato real persistem no backend quando o bloqueio #1 estiver resolvido (documentar status no PR se ainda bloqueado); nenhum campo sem contrato é forçado no payload; UI idêntica.

---

## Sprint 3 — Lembretes e Eventos → Agenda

**Objetivo:** persistir `reminders` e `events` como `Agenda` real no backend. O backend não distingue "lembrete" de "evento" — só tem `Agenda` (compromisso agendado, com `titulo`/`informacao`/`dataAgendada`/`statusAgenda`) referenciando um `Evento` (apenas um **tipo**, sem data própria: `consulta`, `exame`, `ultrassom`, `vacinacao`, `outro`). O modelo de domínio da aplicação (`application/agenda`) unifica os dois conceitos locais sob um único caso de uso, mantendo as telas exatamente como estão.

**Mapeamento:**

| Campo local | Destino |
|---|---|
| `title` (lembrete/evento) | `Agenda.titulo` |
| `date` + `time` | `Agenda.dataAgendada` (combinados em `LocalDateTime` ISO) |
| `notes` (evento) | `Agenda.informacao` |
| `cat` (lembrete: Medicamento/Consulta/Exame/Outro) | resolvido para `Evento.id` — ver bloqueio abaixo |
| `color` (lembrete), `local` (evento), `done` (lembrete) | **sem campo correspondente em `Agenda`** — continuam locais, anexados por `id` do compromisso remoto (`AsyncStorage` guarda um mapa `{ [agendaId]: { color, local, done } }`) |

> **Bloqueio conhecido — categorias divergentes:** as categorias de `AddReminderScreen` (`Medicamento`, `Consulta`, `Exame`, `Outro`) não batem 1:1 com os tipos fixos de `Evento` no backend (`consulta`, `exame`, `ultrassom`, `vacinacao`, `outro`). Falta `Medicamento` no backend. Decisão adotada: mapear `Consulta→consulta`, `Exame→exame`, `Medicamento→outro`, `Outro→outro` (perda de granularidade documentada, sem alterar as opções visíveis na tela). Buscar os `id`s reais via `GET /api/eventos` uma vez no boot e cachear — não fazer `POST /api/eventos` a cada lembrete.
>
> **Nota semântica:** `done` (concluído, local) e `statusAgenda` (`AGENDADO`/`CANCELADO`, remoto) **não são a mesma coisa** — não reaproveitar `PATCH .../cancelar` para marcar "concluído". `done` continua 100% local.

**Execute:**
1. `src/application/agenda/`: `listarTiposEvento` (cacheia `GET /api/eventos`), `registrarCompromisso(dadosLocal, tipoLabel)`, `listarCompromissos()` (busca `GET /api/agendas`, filtra client-side pelos compromissos do usuário logado, mescla com metadados locais), `removerCompromisso(id)`.
2. `AppContext.addReminder`/`addEvent` passam a chamar `registrarCompromisso` além de atualizar o estado local (aditivo — UI não espera a resposta da API para atualizar, faz *optimistic update* e reconcilia depois, preservando a responsividade atual).
3. `AppContext.deleteReminder`/`deleteEvent` passam a chamar `removerCompromisso`.
4. `toggleReminder` continua 100% local (não mexe em `statusAgenda`).
5. **Ajuste feito na execução:** `loadUserData` não faz `GET /api/agendas` completo a cada boot para "puxar" compromissos que só existem no servidor — não há como saber, só pelo registro, se ele pertence à lista de `reminders` ou de `events` locais (essa distinção é só de UI, não existe no schema). Em vez disso, a sincronização é de **mão única + autocura**: `addReminder`/`addEvent` sincronizam no momento da criação (guardando o `remoteId` retornado), `deleteReminder`/`deleteEvent` removem no backend pelo `remoteId` quando existe, e todo item local sem `remoteId` (offline na hora de criar, ou criado antes desta sprint) é reenviado silenciosamente no próximo boot. Puxar registros criados só no backend/outro dispositivo para as listas locais fica registrado no Backlog — é uma decisão de produto (que UI eles devem virar), não só engenharia.

**Testes desta sprint:**
- Unitários: mapeamento categoria→tipo de evento, `registrarCompromisso`, `listarCompromissos` (merge remoto+local), `AgendaRepository`.
- Manual: criar lembrete e evento, fechar/reabrir o app, confirmar que aparecem via `GET /api/agendas`; remover e confirmar `DELETE`.

**Definição de pronto:** lembretes/eventos reais persistidos em `Agenda`; metadados sem contrato (cor, local, done) preservados localmente; filtros de `RemindersScreen`/`CalendarScreen`/contadores de `HomeScreen` continuam funcionando sem alteração visual.

---

## Sprint 4 — Resiliência e consolidação

**Objetivo:** fechar lacunas transversais que Mobile exige e Web não precisou (rede instável, app em background, sem sessão de browser).

**Execute:**
1. Interceptor de resposta no `apiClient`: em erro de rede (sem conexão), telas continuam mostrando o último dado local cacheado — sem crash, sem tela em branco (Mobile First: usuária pode estar em rede de hospital/UBS instável).
2. Interceptor de resposta: `401` em qualquer chamada autenticada dispara `logout()` automaticamente (sessão expirada/senha trocada em outro dispositivo) — reaproveita o mesmo `AppContext.logout` já existente.
3. Auditoria final: `grep` por `fetch(` remanescente no projeto — deve sobrar zero uso fora de `apiClient`; `grep` por leitura/escrita de senha em `AsyncStorage` — deve sobrar zero.
4. Rodar a suíte `jest-expo` completa + checklist manual dos fluxos das Sprints 1–3 em dispositivo físico (Expo Go) e não só web, já que `src/config.js` tem caminho de rede diferente por `Platform.OS`.

**Testes desta sprint:**
- Unitários: interceptors (offline, 401).
- Manual: testar em Expo Go num celular físico na mesma rede (`MEU_IP` em `src/config.js`), não só no `expo start --web`.

**Definição de pronto:** suíte 100% verde; nenhum `fetch` cru restante para rotas já cobertas; app não quebra sem rede; layout inalterado em todas as telas tocadas.

> **Execução real (2026-08-14):**
> - Resiliência offline (ponto 1) já saiu satisfeita das Sprints 2/3 por construção: toda chamada de sincronização em segundo plano (`registrarOuAtualizarGestante`, `registrarCompromisso`/`removerCompromisso`, `obterGestanteDoUsuario`) é `.catch(() => {})` e nunca bloqueia a UI local — só os fluxos que já eram bloqueantes antes (login, cadastro, troca de senha) continuam mostrando erro amigável, como faziam antes desta integração.
> - Ponto 2 implementado em `src/infrastructure/http/unauthorizedHandler.js` + `unauthorizedInterceptor.js`: 401 numa chamada que usa a sessão corrente (sem `auth` explícito no config) dispara `logout()` automaticamente via `AppContext`. Verificação de login/restauração (que passam `auth` explícito para *testar* a senha) fica de fora da regra — um 401 ali é "senha errada", não "sessão expirou".
> - Auditoria (pontos 3/4): `grep` confirma zero `fetch(` cru restante em `src/` e nenhuma senha fora do `SecureStorage`/`credentialsStore` (o único uso de `AsyncStorage` fora de `AppContext.jsx` são duas menções em texto/comentário, não código).
> - **Não executado nesta sessão:** validação manual em Expo Go num dispositivo físico — este ambiente não tem emulador/celular conectado. Recomendado como próximo passo antes de considerar a integração pronta para uso real.

---

## Backlog (fora do escopo deste plano)

- **Questionário completo** (`POST /api/questionarios`) — exige tela nova (idade, primeira gestação, condição de saúde, pré-natal, alergia, aceite de termos não são coletados hoje). Planejar como sprint separada quando a UX for definida.
- **Gestação** (`POST /api/gestacoes`) — **continua bloqueada no backend**: `Backend_Babybuddy/docs/plano-alteracao-schema-2026-08-13.md` confirma que a coluna `esta_na_sua_primeira_gestacao` (`NOT NULL`) ainda não é mapeada por `Gestacao.java` (pendência #1 do documento, não resolvida até 2026-08-14). Não iniciar integração até o backend confirmar a correção.
- **Materiais/Artigos, Favoritos, Suporte, Administrador** — não existem telas no mobile hoje; réplica do padrão já usado no Web quando/se essas telas forem criadas.
- **Histórico de Gestação** (`GestacaoHistorico`, ex.: peso/pressão por semana) — depende de `Gestação` existir primeiro; mesma trava acima.
- **Testes E2E on-device** (Detox ou Maestro) — avaliar depois que o MVP funcional (Sprints 0–4) estiver estável; Maestro é a opção mais leve para Expo se for adotado.
- **Push notifications reais** (`NotificationsScreen` hoje é 100% derivada de `reminders`/`events` locais) — não há entidade de notificação no backend; ver se entra no escopo de `Agenda` ou fica cliente-only por design.

## Checklist de "não fazer" (repetir antes de cada PR/entrega de sprint)

- [ ] Nenhum `StyleSheet.create` foi alterado.
- [ ] Nenhuma estrutura JSX visual foi alterada (só lógica/dados dentro dos handlers e do `AppContext`).
- [ ] Nenhuma funcionalidade que já funcionava (mesmo só local) parou de funcionar.
- [ ] `useApp()` continua expondo exatamente as mesmas chaves que as telas já consomem.
- [ ] Nenhuma senha/credencial em `AsyncStorage` — só em `SecureStorage` (SecureStore/localStorage-web, como já é hoje).
- [ ] Testes unitários da sprint passando (`jest-expo`).
- [ ] Testado manualmente em Expo Go num dispositivo/emulador, não só `expo start --web`.
- [ ] Nenhuma dependência nova além da estritamente necessária (`axios`, `jest-expo`, `@testing-library/react-native` — só na Sprint 0).
- [ ] Nenhum bloqueio conhecido (Sprint 2 #1/#2, Sprint 3 categorias) foi "resolvido" silenciosamente sem registrar a decisão tomada no PR.
