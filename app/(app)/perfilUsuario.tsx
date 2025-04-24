// app/profile.js
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { auth, firestore } from '../../backend/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HamburgerMenu from '../../components/ui/HamburgerMenu';

export default function ProfileScreen() {
  interface UserData {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
    specialty?: string;
    crp?: string;
    createdAt?: { seconds: number };
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    (async () => {
      if (user) {
        const snap = await getDoc(doc(firestore, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as Omit<UserData, 'id'>;
          setUserData({ id: snap.id, ...data });
        }
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Usuário não encontrado.</Text>
      </View>
    );
  }

  // Optionally format createdAt if available
  const createdAt = userData.createdAt
    ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('pt-BR')
    : '';

  return (
    <SafeAreaView style={styles.container}>

        <ScrollView contentContainerStyle={styles.scroll}>
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            style={styles.header}
          >
            <View style={styles.avatarContainer}>
              {userData.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={100} color="white" />
              )}
            </View>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.label}>Especialidade</Text>
            <Text style={styles.value}>{userData.specialty}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Registro Profissional</Text>
            <Text style={styles.value}>{userData.crp}</Text>
          </View>

          {createdAt ? (
            <View style={styles.cardRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.valueSmall}>
                Cadastrado em {createdAt}
              </Text>
            </View>
          ) : null}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#F44336' },

  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  avatar: { width: 104, height: 104, borderRadius: 52 },

  name: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  label: { fontSize: 14, color: '#555', marginBottom: 4 },
  value: { fontSize: 16, color: '#212121', fontWeight: '500' },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  valueSmall: { fontSize: 14, color: '#666', marginLeft: 8 },
});
