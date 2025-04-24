import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../backend/firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/home');
      } else {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Dados incompletos', 'Por favor, preencha e‑mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      if ((error as { code: string }).code === 'auth/user-not-found') {
        Alert.alert(
          'Usuário não encontrado',
          'Não há registro deste e‑mail. Por favor, cadastre‑se primeiro.',
          [{ text: 'Ir para cadastro', onPress: () => router.push('/cadastro') }]
        );
      } else if ((error as { code: string }).code === 'auth/wrong-password') {
        Alert.alert('Senha incorreta', 'Verifique sua senha e tente novamente.');
      } else {
        Alert.alert('Erro ao autenticar', (error as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={[styles.container, { backgroundColor: '#fff' }]}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/abstract-pattern-coloured-oil-bubbles-water.jpg')}
      style={styles.container}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>AgroScan</Text>
        <Text style={styles.subtitle}>Identifique pragas e cuide da sua plantação!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/recuperarSenha')}
        >
          <Text style={styles.linkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/cadastro')}
          disabled={isLoading}
        >
          <Text style={styles.signupText}>Não tem uma conta? Cadastre‑se</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageStyle: { opacity: 0.75 },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 25,
    width: '85%',
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
  },
  title: { fontSize: 34, color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#f2f2f2', marginBottom: 25, textAlign: 'center' },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkButton: {
    marginBottom: 15,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signupLink: { marginTop: 5 },
  signupText: { color: '#fff', fontSize: 14, textDecorationLine: 'underline' },
});
