# Leitura de artigos

A tela usa `conteudoUrl` e `conteudoMimeType` para leitura e `pdfUrl` para download. HTML sanitizado pelo backend é exibido na WebView com layout responsivo e scripts desativados; links HTTP/HTTPS abrem externamente. Na web, usa iframe com sandbox e CSP. Conteúdo PDF legado usa PDF.js incorporado em `src/components/pdfEngine.json`, gerado por `npm run prepare:pdf`. Ao atualizar `pdfjs-dist`, regenere esse arquivo. Os avisos de licença Apache-2.0 estão preservados.

- Android: Baixar PDF abre o seletor de pasta do sistema.
- iOS: Baixar PDF abre o menu do sistema, que oferece Salvar em Arquivos.
- Celular: Compartilhar no WhatsApp abre o menu de compartilhamento do sistema. O usuário escolhe WhatsApp e o destinatário; o aplicativo não envia mensagens automaticamente.
- Web: o download usa um arquivo Blob. Compartilhar depende de Web Share com arquivos e contexto seguro (HTTPS). O primeiro toque prepara o PDF; um segundo toque inicia o compartilhamento quando necessário para manter o gesto exigido pelo navegador. Sem suporte, a interface orienta baixar e anexar manualmente no WhatsApp. A mensagem de download confirma somente seu início.

O PDF é baixado na primeira ação e reutilizado durante a visita ao artigo. Sair durante o download impede a abertura tardia do compartilhamento. Temporários não compartilhados são removidos ao sair, depois das ações pendentes. Anexos compartilhados permanecem no cache por pelo menos 24 horas, pois o destinatário pode lê-los após fechar o seletor; a próxima carga de PDF remove os arquivos antigos. Falhas de leitura oferecem nova tentativa e não impedem baixar um PDF disponível. Artigos HTML sem PDF permanecem legíveis. O navegador precisa de CORS habilitado na API.

## Backend e implantação

- `GET /api/materiais/{id}/conteudo`: HTML de leitura; registros legados também podem retornar PDF.
- `GET /api/materiais/{id}/pdf`: arquivo `application/pdf` com `Content-Disposition: attachment`. Somente artigos ativos são públicos.
- Novos uploads PDF preservam os bytes originais em `pdf_arquivo`, além da versão HTML. `pdf_original` distingue original e arquivo gerado.
- Artigos HTML/Markdown e registros antigos com somente HTML recebem PDF gerado no primeiro download e armazenado no banco. Mudanças de conteúdo, metadados ou imagem invalidam o PDF gerado. O original é preservado até substituir o artigo.
- O cache só é gravado se a versão do artigo ainda for a mesma; uma geração iniciada antes de uma edição não substitui o cache novo.
- PDFs antigos já convertidos em HTML não recuperam a diagramação original. Para isso, reenvie o original. Arquivos PDF ainda existentes no armazenamento legado são entregues integralmente.
- A exportação de HTML usa OpenHTMLToPDF. Imagens externas aparecem como links, sem o servidor buscar URLs arbitrárias. A imagem cadastrada separadamente é incorporada quando PNG/JPEG; WebP permanece disponível na leitura. PDFs originais mantêm todas as imagens e diagramação.

Reinicie o backend após aplicar as mudanças. Com o padrão `JPA_DDL_AUTO=update`, Hibernate cria as duas novas colunas nullable. Em ambientes com `validate`/`none`, aplique primeiro `Backend_Babybuddy/docs/sql/article-pdf.sql`. Não é necessário converter os registros existentes antecipadamente. Configure CORS para a origem web de produção.

## Testes automatizados

Mobile: `npm test -- --runInBand`, `npx expo install --check` e `npx expo export --platform all --output-dir dist`.

Backend: `.\mvnw.cmd '-Dtest=MaterialServiceTest,MaterialControllerTest,MaterialImageTest,MaterialPdfRepositoryTest' test`. A persistência é testada em H2 isolado no modo SQL Server, sem acessar o banco de produção.

## Verificação manual em dispositivos

Abra um artigo de várias páginas, avance e volte páginas, use zoom por gesto e confira a leitura. Salve em uma pasta no Android e em Arquivos no iOS; abra o arquivo salvo. Compartilhe, escolha WhatsApp e confira o anexo antes de enviar. Cancele os seletores e confirme que não aparece confirmação de salvamento. Teste também API indisponível, PDF inexistente, artigo sem PDF e retorno rápido à lista durante o carregamento.

A documentação Expo v56 foi consultada conforme AGENTS.md, seguida da documentação v57 durante a atualização. O projeto usa SDK 57, com React, React Native e módulos alinhados às versões indicadas pelo Expo. A API `expo-file-system/legacy` continua suportada no SDK 57. A exportação de bundles e os testes automatizados não substituem a conferência do salvamento e WhatsApp em aparelhos reais.
