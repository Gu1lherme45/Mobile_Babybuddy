import { Linking } from 'react-native'
import { WebView } from 'react-native-webview'

export default function ArticleHtml({ html, onError }) {
  return <WebView source={{ html }} style={{ height: 600, backgroundColor: '#FFF' }}
    originWhitelist={['*']} javaScriptEnabled={false} domStorageEnabled={false}
    allowFileAccess={false} mixedContentMode="never" setSupportMultipleWindows={false}
    onError={onError} onHttpError={onError}
    onShouldStartLoadWithRequest={({ url }) => {
      if (url === 'about:blank') return true
      if (/^https?:\/\//i.test(url)) Linking.openURL(url).catch(onError)
      return false
    }} />
}
