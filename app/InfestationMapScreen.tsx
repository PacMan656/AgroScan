import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import ClusterMap from 'react-native-map-clustering';

export default function InfestationMapScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Carrega as análises e localização do usuário
  const loadData = async () => {
    try {
      // 1. Obter localização atual do usuário
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }

      // 2. Carregar análises salvas
      const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
      if (savedAnalyses) {
        const parsedAnalyses = JSON.parse(savedAnalyses);
        setAnalyses(parsedAnalyses);
        
        // 3. Se houver análises, ajustar o zoom para a área relevante
        if (parsedAnalyses.length > 0 && mapRef.current) {
          const coordinates = parsedAnalyses.map(a => ({
            latitude: a.latitude,
            longitude: a.longitude
          }));

          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    loadData();
  });

  // Agrupa análises por área geográfica
  const groupByArea = (items, radiusKm = 0.5) => {
    const groups = [];
    
    items.forEach(item => {
      let addedToGroup = false;
      
      // Verifica se está próxima a algum grupo existente
      for (const group of groups) {
        const distance = calculateDistance(
          group.center.latitude,
          group.center.longitude,
          item.latitude,
          item.longitude
        );
        
        if (distance <= radiusKm) {
          group.items.push(item);
          addedToGroup = true;
          break;
        }
      }
      
      // Se não foi adicionada a nenhum grupo, cria um novo
      if (!addedToGroup) {
        groups.push({
          center: { latitude: item.latitude, longitude: item.longitude },
          items: [item]
        });
      }
    });
    
    return groups;
  };

  // Calcula distância entre coordenadas (em km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calcula a severidade predominante em uma área
  const getAreaSeverity = (items) => {
    const counts = { Alta: 0, Média: 0, Baixa: 0 };
    items.forEach(item => counts[item.severity]++);
    
    if (counts.Alta > 0) return 'Alta';
    if (counts.Média > 0) return 'Média';
    return 'Baixa';
  };

  // Retorna cor baseada na severidade
  const getColorBySeverity = (severity) => {
    switch (severity) {
      case 'Alta': return '#F44336';
      case 'Média': return '#FFC107';
      case 'Baixa': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const areaGroups = groupByArea(analyses);

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Mapa de Infestações</Text>
        <TouchableOpacity onPress={loadData}>
          <MaterialIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Mapa com clustering */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation?.latitude || -15.7942,
          longitude: userLocation?.longitude || -47.8825,
          latitudeDelta: 0.1,  // Zoom mais próximo
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Mostrar localização do usuário */}
        {userLocation && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={200} // 200 metros
            fillColor="rgba(66, 165, 245, 0.2)"
            strokeColor="rgba(66, 165, 245, 0.8)"
            strokeWidth={2}
          />
        )}

        {/* Áreas de infestação */}
        {areaGroups.map((group, index) => {
          const severity = getAreaSeverity(group.items);
          const color = getColorBySeverity(severity);
          
          return (
            <View key={`area-${index}`}>
              <Circle
                center={group.center}
                radius={500} // 500 metros
                fillColor={`${color}30`} // Cor com transparência
                strokeColor={color}
                strokeWidth={2}
              />
              
              {/* Marcador central da área */}
              <Marker
                coordinate={group.center}
                onPress={() => router.push({
                  pathname: '/area-detail',
                  params: { 
                    latitude: group.center.latitude,
                    longitude: group.center.longitude,
                    severity,
                    count: group.items.length
                  }
                })}
              >
                <View style={[styles.areaMarker, { backgroundColor: color }]}>
                  <Text style={styles.areaMarkerText}>{group.items.length}</Text>
                </View>
              </Marker>
            </View>
          );
        })}
      </MapView>

      {/* Legenda interativa */}
      <View style={styles.legend}>
        <TouchableOpacity 
          style={styles.legendItem}
          onPress={() => {
            mapRef.current.animateToRegion({
              latitude: userLocation?.latitude || -15.7942,
              longitude: userLocation?.longitude || -47.8825,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            });
          }}
        >
          <MaterialIcons name="my-location" size={20} color="#4CAF50" />
          <Text style={styles.legendText}>Minha Localização</Text>
        </TouchableOpacity>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Área Crítica</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Área de Atenção</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Área Controlada</Text>
        </View>
      </View>

      {analyses.length === 0 && (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="map-marked-alt" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma análise registrada</Text>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => router.push('/camera')}
          >
            <Text style={styles.newButtonText}>Nova Análise</Text>
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
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  areaMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  areaMarkerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    marginLeft: 5,
  },
  emptyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  newButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  newButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});