# Questionário de saúde (anamnese)

Após cadastrar a conta e autenticar, o aplicativo abre o convite para responder
à anamnese. **Responder depois** leva ao aplicativo sem criar uma gestante ou
enviar respostas parciais à API. Nos próximos acessos, o lembrete fica na tela
inicial, no sino de notificações, na lista de notificações e no perfil.

O formulário adapta as perguntas de
`Web_Babybuddy/src/pages/Questionario/Questionario.jsx` para controles nativos,
com progresso, voltar, validação por etapa e links para termos e privacidade.
A pergunta de condição de saúde é pulada quando a resposta anterior é “Não”.
Recusar a personalização não impede a conclusão. As datas são exibidas em
DD/MM/AAAA e enviadas em ISO. A previsão de parto é sugerida pela semana
informada, com a tolerância de sete dias usada no Web. Nas semanas 41 e 42,
uma previsão compatível pode estar no passado.

## Persistência e retomada

- O rascunho e a etapa são salvos a cada alteração, separados pelo ID da usuária,
  em `bb_anamnese_v1_<id>`. Android/iOS usam o wrapper `SecureStorage` existente
  (Expo SecureStore); a versão Web do wrapper usa localStorage.
- **Salvar e continuar depois** aguarda a gravação local. Se ela falhar,
  apresenta uma mensagem e mantém o formulário aberto.
- A API é consultada ao abrir a sessão e ao voltar ao primeiro plano.
  Um questionário já preenchido pelo Web retira o lembrete no aplicativo.
- A conclusão só é registrada depois que a API confirma o questionário.
  Uma falha mantém as respostas e a pendência. O perfil local recebe data de
  nascimento, sangue, semana, previsão de parto e alergias após o envio.
- Ao sair da conta, as requisições de anamnese são canceladas e o provider é
  desmontado. O rascunho fica disponível para o próximo login da mesma conta.
  Ao excluir a conta, sua chave local de anamnese também é removida.
- O alerta é interno ao aplicativo; não agenda notificações push do sistema.

## Contrato reutilizado

| Operação | Rota |
| --- | --- |
| Localizar a gestante pelo `usuario.id` | `GET /api/gestantes` |
| Criar/atualizar a gestante | `POST /api/gestantes`, `PUT /api/gestantes/{id}` |
| Consultar as respostas | `GET /api/questionarios/gestante/{gestanteId}` |
| Criar/atualizar o questionário | `POST /api/questionarios`, `PUT /api/questionarios/{id}` |

As chamadas usam o cliente Axios e a autenticação Basic existentes, com timeout
de 15 segundos por requisição. Antes de enviar, a aplicação consulta novamente
os registros para reaproveitá-los em uma tentativa posterior. As observações
da gestante são preservadas; o questionário mais recente é escolhido por data
de preenchimento e, em caso de empate, por ID. A API não oferece transação ou
chave de idempotência para as duas gravações; clientes gravando simultaneamente
ainda podem criar duplicatas.

Os campos do questionário são `gestante.id`, `idade`, `tipoSanguineo`,
`semanaGestacional`, `primeiraGestacao`, `dataPrevistaParto`, `condicaoSaude`,
`condicaoSaudeOutra`, `prenatalRegular`, `possuiAlergia`, `alergiaEspecificacao`
e `aceiteTermos`. Sim/não e valores acentuados são normalizados como no Web.
Detalhes condicionais têm limite de 200 caracteres.

**Limitação do backend existente:** `jaTeveParto`, `cicloRegular` e
`autorizaUsoDados` não existem na entidade `Questionario` nem no payload do Web.
São preservados apenas no armazenamento local desta conta/aparelho, inclusive
depois do envio, e não sincronizam com outros dispositivos. A autorização local
não implementa uma política de personalização no servidor.

## Verificação reproduzível

Testes de regras, componentes, persistência e cadastro:

```powershell
node --no-experimental-webstorage node_modules/jest/bin/jest.js --runInBand src/domain/questionario src/context/QuestionarioContext.test.jsx src/context/AppContext.test.jsx src/screens/QuestionarioScreen.test.jsx src/screens/ProfileScreen.test.jsx
```

A opção de Node acima contorna a incompatibilidade do Jest 29 com o getter de
localStorage nas versões recentes de Node. Não altera o armazenamento do app.

Integração HTTP local com Postman CLI 1.73.0 (dois terminais):

```powershell
postman simulation run postman/simulations/anamnese.sim.yaml --port 4900 --output ndjson --no-history
```

```powershell
$env:BABYBUDDY_SIMULATION_URL='http://127.0.0.1:4900/babybuddy'
$env:EXPO_PUBLIC_API_URL=$env:BABYBUDDY_SIMULATION_URL
node --no-experimental-webstorage node_modules/jest/bin/jest.js --runInBand src/application/questionario/anamnese.simulation.test.js
```

A suíte HTTP roda o código de aplicação, repositórios, interceptadores e Axios
reais, usando o adaptador HTTP de Node. Cobre criação, leitura, atualização,
isolamento por usuária, preservação de observações, falha na consulta e repetição
após falha parcial de gravação. Sem a variável de simulação, esses quatro testes
são ignorados na suíte comum.

O mock local foi escrito a partir das entidades e controllers do projeto irmão
`Backend_Babybuddy` e do formulário Web. A sessão Postman estava sem login;
nenhum mock remoto foi pesquisado ou publicado. Os resultados contra esse mock
não substituem a validação com o backend real e um aparelho físico.

Na verificação visual pelo bundle Web exportado, em viewport 390 × 844, foram
percorridos cadastro → convite → adiamento → notificações → rascunho → recarga
da página → retomada → envio com erro 503 → reenvio → conclusão. O lembrete foi
retirado e a semana de gestação apareceu na tela inicial. Os bundles Expo para
Android, iOS e Web também foram exportados; isso valida o empacotamento, não a
execução em dispositivos nativos.

Resultado da suíte completa nesta alteração: 163 testes passaram e dois testes
preexistentes falharam em arquivos não alterados: `cadastrarUsuario.test.js`
(mensagem de e-mail duplicado) e `Material.test.js` (fallback de URL do PDF).
Todos os 31 testes novos de anamnese passaram, incluindo os quatro de HTTP.

Para explorar a interface com dados fictícios, use a mesma URL em
`EXPO_PUBLIC_API_URL` e execute `npx expo start --web`. O mock também modela as
rotas de cadastro e identificação usadas nesse fluxo. Não use credenciais reais
nessa simulação e não configure a URL local em builds distribuídos.

Documentação Expo consultada: https://docs.expo.dev/versions/v57.0.0/.
