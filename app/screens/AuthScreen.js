import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Button, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const { colors, dark } = useTheme();
  const { toggleTheme } = useThemeMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login');
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const onSubmit = () => {
    if (mode === 'login') signIn(email, password);
    else signUp(email, password, name);
  };

  return (
    <ImageBackground source={require('../../assets/images/splash-icon.png')} style={styles.bg} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <View style={styles.topBar}>
        <Text style={[styles.brand, { color: '#fff' }]}>Framez</Text>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
          <Ionicons name={dark ? 'sunny' : 'moon'} size={24} color={'#fff'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.container, { backgroundColor: dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)' }, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={[styles.title, { color: dark ? '#fff' : '#111' }]}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
        {mode === 'signup' && (
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={[styles.input, { color: colors.text, borderColor: dark ? '#444' : '#ddd', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]} placeholderTextColor={dark ? '#aaa' : '#888'} />
        )}
        <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={[styles.input, { color: colors.text, borderColor: dark ? '#444' : '#ddd', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]} placeholderTextColor={dark ? '#aaa' : '#888'} />
        <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={[styles.input, { color: colors.text, borderColor: dark ? '#444' : '#ddd', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]} placeholderTextColor={dark ? '#aaa' : '#888'} />
        <View style={{ height: 8 }} />
        <Button title={mode === 'login' ? 'Log In' : 'Sign Up'} onPress={onSubmit} />
        <View style={{ height: 12 }} />
        <Button
          title={mode === 'login' ? "Don't have an account? Sign Up" : 'Have an account? Log In'}
          onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        />
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  bgImage: { opacity: 0.24, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  topBar: {
    position: 'absolute', top: 48, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  container: {
    marginHorizontal: 20,
    marginTop: 160,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
});
