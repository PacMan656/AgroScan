// app/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../backend/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';

const dicas = [
  'Rotacao de Culturas: quebra o ciclo de pragas.',
  'Monitore semanalmente suas plantas.',
  'Use controle biologico natural.',
  'Armadilhas adesivas contra insetos.',
  'Prefira variedades resistentes.',
];

export default function HomeScreen() {
  const router = useRouter();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, current => {
      if (!current) router.replace('/login');
      else setUser(current);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadLocalAnalyses(user.uid);
  }, [user]);

  const loadLocalAnalyses = async (uid: string) => {
    try {
      const stored = await AsyncStorage.getItem(`@analyses_${uid}`);
      const list = stored ? JSON.parse(stored) : [];
      setRecentAnalyses(list.slice(0, 3));
    } catch (e) {
      console.error('Erro ao carregar dados locais:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDailyTip(dicas[new Date().getDay() % dicas.length]);
  }, []);

  const handleNew = () => router.push({ pathname: '/novaPesquisa' });
  const handleHistory = () => router.push('/historico');
  const handleMap = () => router.push('/mapaInfestacao');
  const handleRec = () => router.push('/recomendacoes');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Ola, {user?.displayName ?? user?.email ?? 'Analista'}!
        </Text>
        <Text style={styles.subtitle}>Bem-vindo ao AgroScan</Text>

        <LinearGradient colors={['#2E7D32', '#4CAF50']} style={styles.cardStatus}>
          <View style={styles.statusRow}>
            <FontAwesome5 name="bug" size={24} color="white" />
            <View style={styles.statusText}>
              <Text style={styles.statusNumber}>{recentAnalyses.length}</Text>
              <Text style={styles.statusLabel}>Análises recentes</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tipCard}>
          <Ionicons name="sparkles" size={20} color="#FFC107" />
          <Text style={styles.tipText}>{dailyTip}</Text>
        </View>

        <Text style={styles.section}>Ações Rápidas</Text>
        <View style={styles.actions}>
          <Action icon="camera-alt" label="Nova" onPress={handleNew} color="#4CAF50" />
          <Action icon="history" label="Histórico" onPress={handleHistory} color="#2196F3" />
          <Action icon="map" label="Mapa" onPress={handleMap} color="#9C27B0" />
          <Action icon="lightbulb" label="Recomendações" onPress={handleRec} color="#FF9800" />
        </View>

        <Text style={styles.section}>Ultimas Análises</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : recentAnalyses.length ? (
          recentAnalyses.map(a => (
            <AnalysisCard
              key={a.id}
              analysis={a}
              onPress={() => router.push(`/analysis-detail/${a.id}`)}
            />
          ))
        ) : (
          <Text style={styles.empty}>Nenhuma análise encontrada</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Action = ({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) => (
  <TouchableOpacity style={[styles.action, { backgroundColor: color }]} onPress={onPress}>
    <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={28} color="white" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

interface Analysis {
  id: string;
  pestName?: string;
  date: string;
  severity?: 'Alta' | 'Média' | 'Baixa';
}

const AnalysisCard = ({ analysis, onPress }: { analysis: Analysis; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View>
      <Text style={styles.cardTitle}>{analysis.pestName || 'Desconhecido'}</Text>
      <Text style={styles.cardDate}>
        {new Date(analysis.date).toLocaleDateString()}
      </Text>
    </View>
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            analysis.severity === 'Alta'
              ? '#F44336'
              : analysis.severity === 'Média'
              ? '#FFC107'
              : '#4CAF50',
        },
      ]}
    >
      <Text style={styles.badgeText}>{analysis.severity || 'Baixa'}</Text>
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#212121' },
  subtitle: { fontSize: 16, color: '#616161', marginBottom: 20 },
  cardStatus: { borderRadius: 12, padding: 20, marginBottom: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { marginLeft: 16 },
  statusNumber: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  statusLabel: { fontSize: 14, color: 'white' },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  tipText: { marginLeft: 10, fontSize: 14, color: '#333' },
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  action: { width: '23%', borderRadius: 10, padding: 12, alignItems: 'center' },
  actionLabel: { marginTop: 6, color: 'white', fontSize: 12, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  cardDate: { fontSize: 12, color: '#757575' },
  badge: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8 },
  badgeText: { color: 'white', fontSize: 12 },
  empty: { textAlign: 'center', color: '#757575', marginTop: 20 },
});
