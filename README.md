# BabyBuddy Mobile

## Conexão com o backend

A URL da API pode ser definida com a variável pública do Expo
`EXPO_PUBLIC_API_URL`. Ela contém apenas um endereço de rede e não deve conter
senhas, tokens ou outros segredos.

Os valores padrão, quando a variável não existe, são:

- Expo Web e simulador iOS: `http://localhost:8080`
- Emulador Android: `http://10.0.2.2:8080`

Para executar em um celular físico:

1. Inicie o backend na porta `8080`.
2. Conecte o celular e o computador na mesma rede Wi-Fi.
3. Descubra o IPv4 do computador com `ipconfig`.
4. Copie `.env.example` para `.env.local` e substitua o IP do exemplo.
5. Inicie o app com `npm start` e faça um reload completo no Expo Go.

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
