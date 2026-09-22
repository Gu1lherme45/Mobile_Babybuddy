import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useApp } from '../context/AppContext'
import { View, ActivityIndicator } from 'react-native'
import { Icon } from '../components/Icon'

import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import HomeScreen from '../screens/HomeScreen'
import CalendarScreen from '../screens/CalendarScreen'
import RemindersScreen from '../screens/RemindersScreen'
import AddReminderScreen from '../screens/AddReminderScreen'
import AddEventScreen from '../screens/AddEventScreen'
import ProfileScreen from '../screens/ProfileScreen'
import PersonalDataScreen from '../screens/PersonalDataScreen'
import ChangePasswordScreen from '../screens/ChangePasswordScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import DeleteAccountScreen from '../screens/DeleteAccountScreen'
import PrivacyScreen from '../screens/PrivacyScreen'
import TermsScreen from '../screens/TermsScreen'
import MaterialsScreen from '../screens/MaterialsScreen'
import MaterialDetailScreen from '../screens/MaterialDetailScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#EC407A',
        tabBarInactiveTintColor: '#C9A8B5',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F5DAE4',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const iconMap = { Home: 'home', Calendario: 'cal', Lembretes: 'bell', Perfil: 'user' }
          return <Icon name={iconMap[route.name]} color={color} size={size - 2} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Calendario" component={CalendarScreen} options={{ tabBarLabel: 'Calendário' }} />
      <Tab.Screen name="Lembretes" component={RemindersScreen} options={{ tabBarLabel: 'Lembretes' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  )
}

function AppNavigator() {
  const { currentUser, authLoading } = useApp()

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F8' }}>
        <ActivityIndicator size="large" color="#EC407A" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!currentUser ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="AddReminder" component={AddReminderScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="PersonalData" component={PersonalDataScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Materials" component={MaterialsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
