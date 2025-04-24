// Código completo com exibição de múltiplas análises no modal
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Circle,
  Region,
} from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

type AnalysisItem = {
  latitude: number;
  longitude: number;
  severity: 'Alta' | 'Média' | 'Baixa' | string;
  [key: string]: any;
};

export default function InfestationMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: -15.7942,
    longitude: -47.8825,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [selectedGroup, setSelectedGroup] = useState<AnalysisItem[] | null>(null);

  const startLocationUpdates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const last = await Location.getLastKnownPositionAsync();
    if (last) updateLocation(last.coords.latitude, last.coords.longitude);

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 5000, distanceInterval: 10 },
      loc => updateLocation(loc.coords.latitude, loc.coords.longitude)
    );
  };

  const updateLocation = (latitude: number, longitude: number) => {
    setUserLocation({ latitude, longitude });
    const newRegion = { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@pest_analyses');
      if (saved) {
        const parsed: AnalysisItem[] = JSON.parse(saved);
        setAnalyses(parsed);
      }
      await startLocationUpdates();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao carregar dados da aplicação.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(React.useCallback(() => {
    setLoading(true);
    loadData();
  }, []));

  useEffect(() => () => locationSubscription.current?.remove(), []);

  const groupByArea = (items: AnalysisItem[], radiusKm = 0.5) => {
    const groups: { center: { latitude: number; longitude: number }; items: AnalysisItem[] }[] = [];
    items.forEach(item => {
      let added = false;
      for (const grp of groups) {
        const d = calculateDistance(grp.center.latitude, grp.center.longitude, item.latitude, item.longitude);
        if (d <= radiusKm) {
          grp.items.push(item);
          added = true;
          break;
        }
      }
      if (!added) groups.push({ center: { latitude: item.latitude, longitude: item.longitude }, items: [item] });
    });
    return groups;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getAreaSeverity = (items: AnalysisItem[]) => {
    const cnt: Record<string, number> = { Alta: 0, Média: 0, Baixa: 0 };
    items.forEach(i => cnt[i.severity] = (cnt[i.severity] || 0) + 1);
    if (cnt.Alta > 0) return 'Alta';
    if (cnt['Média'] > 0) return 'Média';
    return 'Baixa';
  };

  const getColorBySeverity = (sev: string) => {
    switch (sev) {
      case 'Alta': return '#F44336';
      case 'Média': return '#FFC107';
      case 'Baixa': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const areaGroups = groupByArea(analyses);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      ) : (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
        >
          {areaGroups.map((grp, i) => {
            const sev = getAreaSeverity(grp.items);
            const color = getColorBySeverity(sev);
            return (
              <React.Fragment key={i}>
                <Circle
                  center={grp.center}
                  radius={500}
                  fillColor={`${color}30`}
                  strokeColor={color}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={grp.center}
                  onPress={() => setSelectedGroup(grp.items)}
                >
                  <View style={{ backgroundColor: color, padding: 5, borderRadius: 5 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{grp.items.length}</Text>
                  </View>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>
      )}

      {selectedGroup && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedGroup(null)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Análises da Região</Text>
            {selectedGroup.map((item, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={styles.bold}>Análise {index + 1}</Text>
                <Text><Text style={styles.bold}>Latitude:</Text> {item.latitude}</Text>
                <Text><Text style={styles.bold}>Longitude:</Text> {item.longitude}</Text>
                <Text><Text style={styles.bold}>Severidade:</Text> {item.severity}</Text>
                {Object.entries(item).map(([key, value]) => (
                  !['latitude', 'longitude', 'severity'].includes(key) && (
                    <Text key={key}><Text style={styles.bold}>{key}:</Text> {String(value)}</Text>
                  )
                ))}
              </View>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedGroup(null)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
  modalContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalClose: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});
