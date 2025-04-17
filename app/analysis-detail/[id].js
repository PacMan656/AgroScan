import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking,TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';

export default function AnalysisDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
        if (savedAnalyses) {
          const analyses = JSON.parse(savedAnalyses);
          const foundAnalysis = analyses.find(item => item.id === id);
          setAnalysis(foundAnalysis);
        }
      } catch (error) {
        console.error('Erro ao carregar análise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Análise não encontrada</Text>
      </View>
    );
  }

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${analysis.latitude},${analysis.longitude}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Análise</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Imagem */}
      <Image source={{ uri: analysis.image }} style={styles.detailImage} />

      {/* Informações da praga */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Praga</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{analysis.pestName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Família:</Text>
          <Text style={styles.infoValue}>{analysis.pestFamily || 'Não informado'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Gravidade:</Text>
          <View style={[
            styles.severityBadge,
            analysis.severity === 'Alta' && { backgroundColor: '#F44336' },
            analysis.severity === 'Média' && { backgroundColor: '#FFC107' },
            analysis.severity === 'Baixa' && { backgroundColor: '#4CAF50' },
          ]}>
            <Text style={styles.severityText}>{analysis.severity}</Text>
          </View>
        </View>
      </View>

      {/* Informações agrícolas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Agrícolas</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Cultura:</Text>
          <Text style={styles.infoValue}>{analysis.cropType}</Text>
        </View>
      </View>

      {/* Localização */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localização</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Endereço:</Text>
          <Text style={styles.infoValue}>{analysis.address}</Text>
        </View>
        
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: analysis.latitude,
            longitude: analysis.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: analysis.latitude,
              longitude: analysis.longitude,
            }}
          >
            <View style={styles.mapMarker}>
              <FontAwesome5 name="map-marker-alt" size={24} color="#F44336" />
            </View>
          </Marker>
        </MapView>
        
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={openInMaps}
        >
          <Text style={styles.mapButtonText}>Abrir no Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registrado em:</Text>
          <Text style={styles.infoValue}>
            {new Date(analysis.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
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
  detailImage: {
    width: '100%',
    height: 300,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  mapMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
  },
  mapButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});