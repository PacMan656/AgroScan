import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// Define the type for an analysis item
interface Analysis {
  id: string;
  image: string;
  pestName: string;
  address: string;
  date: string;
  severity: 'Alta' | 'Média' | 'Baixa';
}

export default function HistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyses = async () => {
    try {
      const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
      if (savedAnalyses) {
        // Ordenar por data (mais recente primeiro)
        const parsedAnalyses = JSON.parse(savedAnalyses);
        (parsedAnalyses as Analysis[]).sort((a: Analysis, b: Analysis) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAnalyses(parsedAnalyses);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      setLoading(false);
    }
  };
  // Atualizar sempre que os parâmetros mudarem ou a tela receber foco
    useEffect(() => {
      loadAnalyses();
    }, [params.refresh]);
  
    useFocusEffect(() => {
      loadAnalyses();
    });
  
    const renderItem = ({ item }: { item: Analysis }) => (
    <TouchableOpacity 
      style={styles.analysisCard}
      onPress={() => router.push(`/analysis-detail/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.analysisImage} />
      <View style={styles.analysisInfo}>
        <Text style={styles.pestName}>{item.pestName}</Text>
        <Text style={styles.location}>{item.address}</Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={[
        styles.severityBadge,
        item.severity === 'Alta' && { backgroundColor: '#F44336' },
        item.severity === 'Média' && { backgroundColor: '#FFC107' },
        item.severity === 'Baixa' && { backgroundColor: '#4CAF50' },
      ]}>
        <Text style={styles.severityText}>{item.severity}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Histórico de Análises</Text>
      </LinearGradient>

      <FlatList
        data={analyses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="history" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma análise registrada</Text>
          </View>
        }
      />
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  analysisCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
  },
  analysisImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  analysisInfo: {
    flex: 1,
    marginLeft: 15,
  },
  pestName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  severityBadge: {
    padding: 8,
    borderRadius: 10,
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
});