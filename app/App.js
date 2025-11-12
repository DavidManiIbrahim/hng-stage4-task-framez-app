import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-gesture-handler';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import Tabs from './navigation/Tabs';
import AuthScreen from './screens/AuthScreen';

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
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Root />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
