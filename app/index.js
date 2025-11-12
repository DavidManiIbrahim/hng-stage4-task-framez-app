import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useThemeMode } from './context/ThemeContext';
import Tabs from './navigation/Tabs';
import AuthScreen from './screens/AuthScreen';

export default function Index() {
	const { sessionLoading, session } = useAuth();
	const { navTheme } = useThemeMode();

	if (sessionLoading) {
		return (
			<View style={[styles.container, styles.center, { backgroundColor: navTheme.colors.background }]}> 
				<ActivityIndicator size="large" color={navTheme.colors.text} />
			</View>
		);
	}

	return session ? <Tabs /> : <AuthScreen />;
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { alignItems: 'center', justifyContent: 'center' },
});
