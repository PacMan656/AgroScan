import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalysisCard from '../app/components/AnalysisCard';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function RecentAnalyses() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyses = async () => {
    try {
      const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
      setAnalyses(savedAnalyses ? JSON.parse(savedAnalyses) : []);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    loadAnalyses();
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando análises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análises Recentes</Text>
        <TouchableOpacity onPress={() => router.push('/camera')}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {analyses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma análise registrada</Text>
          <TouchableOpacity 
            style={styles.newAnalysisButton}
            onPress={() => router.push('/camera')}
          >
            <Text style={styles.newAnalysisButtonText}>Nova Análise</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              onPress={() => router.push(`/analysis-detail/${analysis.id}`)}
            />
          ))}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  newAnalysisButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  newAnalysisButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});