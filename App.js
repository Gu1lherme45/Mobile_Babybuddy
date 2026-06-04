import { AppProvider } from './src/context/AppContext'
import AppNavigator from './src/navigation/index'

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  )
}
