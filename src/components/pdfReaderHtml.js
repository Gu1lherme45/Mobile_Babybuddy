import { engine, worker } from './pdfEngine.json'

export function pdfReaderHtml(base64) {
  // Only validated base64 enters the document; article metadata is never interpreted as HTML.
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) throw new Error('PDF inválido')
  const scriptString = (text) => JSON.stringify(text).replace(/</g, '\\u003c')
  return `<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    body{margin:0;background:#f8f0f5;font:16px system-ui;color:#562339}nav{position:sticky;top:0;background:white;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:8px}button{padding:12px;border:0;border-radius:8px;background:#fce4ec;color:#762547}canvas{display:block;margin:12px auto;max-width:100%;height:auto}#status{text-align:center;padding:10px}
    </style></head><body><nav><button id="prev" disabled aria-label="Página anterior">Anterior</button><span id="page" aria-live="polite"></span><button id="next" disabled aria-label="Próxima página">Próxima</button></nav><p id="status" role="status">Carregando artigo…</p><canvas id="pdf" role="img" aria-label="Página do artigo"></canvas><script type="module">
    let engineUrl, workerUrl;
    try {
      engineUrl = URL.createObjectURL(new Blob([${scriptString(engine)}], {type:'text/javascript'}));
      workerUrl = URL.createObjectURL(new Blob([${scriptString(worker)}], {type:'text/javascript'}));
      const pdfjs = await import(engineUrl);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const data = Uint8Array.from(atob('${base64}'), c => c.charCodeAt(0));
      const doc = await pdfjs.getDocument({data, isEvalSupported:false, useSystemFonts:true}).promise;
      let current = 1;
      const prev = document.getElementById('prev'), next = document.getElementById('next');
      async function render() {
        prev.disabled = next.disabled = true;
        const page = await doc.getPage(current);
        const viewport = page.getViewport({scale:Math.min(2, (innerWidth - 16) / page.getViewport({scale:1}).width * (devicePixelRatio || 1))});
        const canvas = document.getElementById('pdf');
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({canvasContext:canvas.getContext('2d'), viewport}).promise;
        document.getElementById('page').textContent = current + ' / ' + doc.numPages;
        const text = await page.getTextContent();
        canvas.setAttribute('aria-label', text.items.map(item => item.str).join(' '));
        document.getElementById('status').textContent = '';
        prev.disabled = current === 1; next.disabled = current === doc.numPages;
      }
      function fail() {document.getElementById('status').textContent = 'Não foi possível exibir esta página. Você ainda pode baixar ou compartilhar o PDF.';}
      prev.onclick = () => {current--; render().catch(fail)};
      next.onclick = () => {current++; render().catch(fail)};
      await render();
    } catch(e) {document.getElementById('status').textContent = 'Não foi possível exibir o PDF. Tente novamente ou baixe o arquivo.';}
    </script></body></html>`
}
