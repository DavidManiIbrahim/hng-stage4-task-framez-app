import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './navigation/Tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';

function Root() {
  const { sessionLoading, session } = useAuth();
  const { navTheme } = useThemeMode();

  if (sessionLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: navTheme.colors.background }]}>
        <ActivityIndicator size="large" color={navTheme.colors.text} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {session ? <Tabs /> : <AuthScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
