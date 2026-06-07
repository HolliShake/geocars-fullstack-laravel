import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import { api, setToken } from '@/lib/api';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      await setToken(res.token);
      router.replace('/scan');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>GeoCars</Text>
        <Text style={styles.subtitle}>Sign in to bind your device</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          editable={!loading}
        />

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: (typeof Colors)['light'] | (typeof Colors)['dark']) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 16,
      padding: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
    },
    button: {
      marginTop: 24,
      backgroundColor: '#208AEF',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    errorBox: {
      backgroundColor: '#FEE2E2',
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
    },
    errorText: {
      color: '#B91C1C',
      fontSize: 13,
    },
  });
}
