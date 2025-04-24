// app/register.js
import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, firestore } from '../../backend/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function RegistrationScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    crp: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState(false);

  interface FormState {
    name: string;
    email: string;
    password: string;
    specialty: string;
    crp: string;
  }

  interface ErrorsState {
    [key: string]: string | null;
  }

  const handleChange = (key: keyof FormState, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  };

  const validate = () => {
    const e: ErrorsState = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E‑mail é obrigatório';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'E‑mail inválido';
    if (!form.password || form.password.length < 6) e.password = 'Senha ≥ 6 caracteres';
    if (!form.specialty.trim()) e.specialty = 'Especialidade é obrigatória';
    if (!form.crp.trim()) e.crp = 'CRP/CRMV é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCred.user;
      // atualiza displayName
      await updateProfile(user, { displayName: form.name });
      // salva no Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        name: form.name,
        email: form.email,
        specialty: form.specialty,
        crp: form.crp,
        createdAt: serverTimestamp()
      });
      router.replace('/perfilUsuario');
    } catch (err) {
      Alert.alert('Erro ao cadastrar', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient colors={['#2E7D32', '#4CAF50']} style={styles.header}>
        <FontAwesome5 name="seedling" size={32} color="white" />
        <Text style={styles.headerTitle}>Cadastro de Analista</Text>
        <Text style={styles.headerSubtitle}>Junte-se à comunidade AgroScan</Text>
      </LinearGradient>

      <View style={styles.form}>
        {/** Nome **/}
        <View style={styles.group}>
          <Text style={styles.label}>Nome Completo</Text>
          <View style={[styles.inputBox, errors.name && styles.inputError]}>
            <MaterialIcons name="person" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              value={form.name}
              onChangeText={t => handleChange('name', t)}
            />
          </View>
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        {/** Email **/}
        <View style={styles.group}>
          <Text style={styles.label}>E‑mail</Text>
          <View style={[styles.inputBox, errors.email && styles.inputError]}>
            <MaterialIcons name="email" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="email@dominio.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={t => handleChange('email', t)}
            />
          </View>
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>

        {/** Senha **/}
        <View style={styles.group}>
          <Text style={styles.label}>Senha</Text>
          <View style={[styles.inputBox, errors.password && styles.inputError]}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha (≥ 6 caracteres)"
              secureTextEntry
              value={form.password}
              onChangeText={t => handleChange('password', t)}
            />
          </View>
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>

        {/** Especialidade **/}
        <View style={styles.group}>
          <Text style={styles.label}>Especialidade</Text>
          <View style={[styles.inputBox, errors.specialty && styles.inputError]}>
            <FontAwesome5 name="microscope" size={18} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Entomologia"
              value={form.specialty}
              onChangeText={t => handleChange('specialty', t)}
            />
          </View>
          {errors.specialty && <Text style={styles.error}>{errors.specialty}</Text>}
        </View>

        {/** CRP **/}
        <View style={styles.group}>
          <Text style={styles.label}>Registro Profissional</Text>
          <View style={[styles.inputBox, errors.crp && styles.inputError]}>
            <MaterialIcons name="assignment" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="CRP/CRMV"
              value={form.crp}
              onChangeText={t => handleChange('crp', t)}
            />
          </View>
          {errors.crp && <Text style={styles.error}>{errors.crp}</Text>}
        </View>

        {/** Botão **/}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : (
              <>
                <Text style={styles.buttonText}>Cadastrar</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </>
            )
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.link}>
            Já possui conta? <Text style={styles.linkAction}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f5f5' },
  header: { paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  group: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#555', marginBottom: 8, marginLeft: 5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  inputError: { borderColor: '#F44336' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  error: { color: '#F44336', fontSize: 12, marginTop: 5, marginLeft: 5 },
  button: { backgroundColor: '#2E7D32', borderRadius: 12, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 3 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 10 },
  link: { textAlign: 'center', marginTop: 20, color: '#666' },
  linkAction: { color: '#4CAF50', fontWeight: 'bold' }
});
