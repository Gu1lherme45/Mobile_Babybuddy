import { useMemo } from 'react'
import { WebView } from 'react-native-webview'
import { pdfReaderHtml } from './pdfReaderHtml'

export default function ArticlePdf({ file }) {
  const source = useMemo(() => ({ html: pdfReaderHtml(file.base64) }), [file])
  return <WebView source={source} style={{ height: 580, backgroundColor: '#F8F0F5' }}
    originWhitelist={['*']} onShouldStartLoadWithRequest={({ url }) => url === 'about:blank'}
    javaScriptEnabled setSupportMultipleWindows={false} />
}
