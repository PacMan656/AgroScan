import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalysisCard from '../app/components/AnalysisCard';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function AnalysesScreen() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyses = async () => {
    try {
      const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
      if (savedAnalyses) {
        // Ordenar por data (mais recente primeiro)
        const parsedAnalyses = JSON.parse(savedAnalyses);
        parsedAnalyses.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAnalyses(parsedAnalyses);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      setLoading(false);
    }
  };

  // Recarregar quando a tela receber foco
  useFocusEffect(() => {
    loadAnalyses();
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando análises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Minhas Análises</Text>
        <TouchableOpacity onPress={() => router.push('/camera')}>
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Lista de análises */}
      {analyses.length > 0 ? (
        <ScrollView 
          contentContainerStyle={styles.analysesContainer}
          showsVerticalScrollIndicator={false}
        >
          {analyses.map((analysis) => (
            <AnalysisCard 
              key={analysis.id} 
              analysis={analysis} 
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="bug-report" size={60} color="#cccccc" />
          <Text style={styles.emptyTitle}>Nenhuma análise encontrada</Text>
          <Text style={styles.emptyText}>Capture imagens de pragas para começar seu monitoramento</Text>
          <TouchableOpacity 
            style={styles.newAnalysisButton}
            onPress={() => router.push('/camera')}
          >
            <Text style={styles.newAnalysisButtonText}>Nova Análise</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  analysesContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  newAnalysisButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    elevation: 3,
  },
  newAnalysisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});