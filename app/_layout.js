import { Slot } from 'expo-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Root layout for expo-router. Wrap providers here so every route has access.
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
