# Leitura de artigos

A tela de detalhes carrega o PDF publicado pela API e o exibe com PDF.js dentro do aplicativo. O motor e o worker estão incluídos em `src/components/pdfEngine.json`, gerado por `npm run prepare:pdf` (também executado após `npm install`). Ao atualizar `pdfjs-dist`, regenere esse arquivo. PDF.js é distribuído sob Apache-2.0; os avisos de licença estão preservados no código incorporado.

- Android: Baixar PDF abre o seletor de pasta do sistema.
- iOS: Baixar PDF abre o menu do sistema, que oferece Salvar em Arquivos.
- Celular: Compartilhar no WhatsApp abre o menu de compartilhamento do sistema. O usuário escolhe WhatsApp e o destinatário; o aplicativo não envia mensagens automaticamente.
- Web: o download usa um arquivo Blob. Compartilhar o arquivo depende de suporte a Web Share com arquivos e contexto seguro (HTTPS). Sem suporte, a interface orienta baixar e anexar manualmente no WhatsApp.

Arquivos temporários são removidos ao sair do artigo. Falhas de rede oferecem nova tentativa. Artigos sem PDF publicado mostram uma mensagem, sem simular conteúdo inexistente. O navegador precisa de CORS habilitado na API para buscar o PDF.

## Verificação manual em dispositivos

Abra um artigo de várias páginas, avance e volte páginas, use zoom por gesto e confira a leitura. Salve em uma pasta no Android e em Arquivos no iOS; abra o arquivo salvo. Compartilhe, escolha WhatsApp e confira o anexo antes de enviar. Cancele os seletores e confirme que não aparece confirmação de salvamento. Teste também API indisponível, PDF inexistente, artigo sem PDF e retorno rápido à lista durante o carregamento.

A implementação consulta a documentação do Expo v56 conforme AGENTS.md, mas instala dependências compatíveis com o SDK 54 declarado neste projeto; não atualiza o SDK inteiro.
