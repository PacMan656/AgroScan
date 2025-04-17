import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

// Tela de Entrada (Login)
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const handleLogin = () => {
    // Lógica de login...
    router.push('/HomeScreen'); // Navega para a tela Home
  };

  return (
    <ImageBackground
      // Adicione sua imagem de fundo
      source={require('../assets/images/abstract-pattern-coloured-oil-bubbles-water.jpg')}
      style={styles.container}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>AgroScan Pragas</Text>
        <Text style={styles.subtitle}>Identifique pragas e cuide da sua plantação!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/RegistrationScreen')}
        >
          <Text style={styles.signupText}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    opacity: 0.8, // Opacidade para a imagem de fundo
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Sobrepor a imagem com um fundo escuro
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
  },
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
    backgroundColor: '#28a745', // Cor verde para botões
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 10,
  },
  signupText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
