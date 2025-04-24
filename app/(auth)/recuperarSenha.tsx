import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../backend/firebase/firebaseConfig'; // Ajuste o caminho conforme necessário
import { useRouter } from 'expo-router';

export default function  PasswordRecovery(){
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordReset = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe o seu e-mail.');
      return;
    }

    setLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(
          'Sucesso',
          'Um e-mail para recuperação de senha foi enviado. Verifique sua caixa de entrada.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      })
      .catch((error) => {
        let errorMessage = '';
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'O endereço de e-mail é inválido.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Nenhum usuário encontrado com este e-mail.';
            break;
          default:
            errorMessage = 'Erro ao enviar o e-mail. Tente novamente.';
        }
        Alert.alert('Erro', errorMessage);
      })
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar E-mail de Recuperação</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>Voltar ao Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#34a853',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#34a853',
    fontSize: 15,
  },
});
