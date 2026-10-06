# BabyBuddy Mobile

## Ambiente e execução

O projeto usa Expo SDK 57 (`expo@~57.0.26`), React Native 0.86.3 e React 19.2.3.
Use Node.js 22.13 ou superior (LTS recomendado).

```powershell
npm ci
npx expo start --clear
```

No celular, use Expo Go compatível com SDK 57 ou gere uma nova build de
desenvolvimento. Builds nativas do SDK anterior precisam ser recompiladas.
O SDK 57 requer iOS 16.4 ou superior e Xcode 26.4 ou superior para compilar iOS.
Veja a [documentação do SDK 57](https://docs.expo.dev/versions/v57.0.0/).

Verificações: `npx expo install --check`, `npx expo-doctor`,
`npm test -- --runInBand` e `npx expo export --platform all`.

## Conexão com o backend

A URL da API pode ser definida com a variável pública do Expo
`EXPO_PUBLIC_API_URL`. Ela contém apenas um endereço de rede e não deve conter
senhas, tokens ou outros segredos. Sem essa variável, `app.config.js` descobre
os endereços IPv4 não internos do computador que inicia o Expo e os inclui na
configuração do app. O cliente tenta os endereços locais automaticamente e
guarda o primeiro que responder à API.

Os valores padrão, quando a variável não existe, são:

- Expo Web e simulador iOS: `http://localhost:8080`
- Emulador Android: `http://10.0.2.2:8080`

Para executar em um celular físico, conecte celular e computador à mesma rede
Wi-Fi e inicie o backend e o Expo normalmente. A lista descoberta é tentada
automaticamente. Interfaces de VPN, Docker e máquinas virtuais também podem
ser descobertas; se uma delas for selecionada sem alcançar o celular, defina
`EXPO_PUBLIC_API_URL` explicitamente com o IPv4 da rede Wi-Fi.

Configuração manual, quando necessária:

1. Inicie o backend na porta `8080`.
2. Conecte o celular e o computador na mesma rede Wi-Fi.
3. Defina `EXPO_PUBLIC_API_URL` com o IPv4 do computador.
4. Inicie ou reinicie o app com `npm start` e faça um reload completo no Expo Go.

Exemplo:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.25:8080
```

No Expo Web, o navegador aplica CORS. O backend do BabyBuddy libera por
padrão as origens locais do Expo nas portas `8081` e `19006`. Em Android e iOS
nativos, CORS não é aplicado pelo navegador; falhas de conexão normalmente
indicam IP incorreto, dispositivos em redes diferentes ou bloqueio da porta
`8080` pelo firewall.

Em builds de produção, use uma URL pública com HTTPS.
