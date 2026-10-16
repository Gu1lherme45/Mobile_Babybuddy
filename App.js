import { AppProvider, useApp } from './src/context/AppContext'
import { QuestionarioProvider } from './src/context/QuestionarioContext'
import AppNavigator from './src/navigation/index'

function SessionApp() {
  const { currentUser } = useApp()
  return (
    <QuestionarioProvider key={currentUser?.id || 'guest'}>
      <AppNavigator />
    </QuestionarioProvider>
  )
}

export default function App() {
  return (
    <AppProvider>
      <SessionApp />
    </AppProvider>
  )
}
