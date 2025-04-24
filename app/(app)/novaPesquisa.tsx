// app/CameraScreen.js
import { useState, useEffect, useRef } from 'react'; 
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Button, Image, Modal, Alert, ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 Firestore
import { firestore } from '../../backend/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// 🎯 Para o Picker de seleção
import { Picker } from '@react-native-picker/picker';

interface Pest {
  id: string;
  commonName: string;
  scientificName: string;
  family?: string;
  description: string;
  affectedCrops: string[];
  lifeCycle?: string;
  damageSymptoms: string[];
  images?: string[];
  diagramUrl?: string;
  preventionMethods: string[];
  biologicalControl?: string[];
  chemicalControl?: {
    productName: string;
    activeIngredient: string;
    dosage?: string;
  }[];
  lastUpdate: any;
  source?: string;
}
export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState('');

  // 👉 Estados novos para pests
  const [pests, setPests] = useState<any[]>([]);
  const [loadingPests, setLoadingPests] = useState(true);


  // Campos de formulário
  const [pestName, setPestName] = useState('');
  const [pestFamily, setPestFamily] = useState('');
  const [cropType, setCropType] = useState('');
  const [severity, setSeverity] = useState('Média');

  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: -14.2350,
    longitude: -51.9253,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchPestsByCrop = async () => {
      if (!cropType) return;
  
      try {
        const response = await fetch(`http://localhost:3001/api/pests?crop=${encodeURIComponent(cropType)}`);
        const data = await response.json();
        setPests(data);
      } catch (error) {
        console.error('Erro ao buscar pragas por cultura:', error);
      }
    };
  
    fetchPestsByCrop();
  }, [cropType]);
  
  // Carrega catálogo de pragas do Firestore
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(firestore, 'pests'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPests(list);
      } catch (err) {
        console.error('Erro ao buscar pests:', err);
        Alert.alert('Erro', 'Não foi possível carregar dados de pragas');
      } finally {
        setLoadingPests(false);
      }
    })();
  }, []);

  // Requisição de permissão de câmera
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão de localização para funcionar corretamente');
      }
    })();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar sua localização');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setSelectedLocation(location.coords);
      setLocation(location.coords);
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Obter endereço
      const address = await Location.reverseGeocodeAsync(location.coords);
      if (address[0]) {
        const street = address[0].street || 'Rua não identificada';
        const district = address[0].district || 'Bairro não identificado';
        setAddress(`${street}, ${district}`);
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setPhoto(photo.uri);
        }
        await getCurrentLocation(); // Obter localização atual ao tirar foto
      } catch (error) {
        console.error('Erro ao capturar foto:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao capturar a foto');
      }
    }
  };

  interface MapPressEvent {
    nativeEvent: {
      coordinate: {
        latitude: number;
        longitude: number;
      };
    };
  }

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    
    // Obter endereço aproximado
    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address[0]) {
        const street = address[0].street || 'Rua não identificada';
        const district = address[0].district || 'Bairro não identificado';
        setAddress(`${street}, ${district}`);
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }
  };

  const saveAnalysis = async () => {
    if (!pestName || !cropType) {
      Alert.alert('Campos obrigatórios', 'Por favor, selecione a praga e preencha o tipo de cultura');
      return;
    }

    try {
      const newAnalysis = {
        id: Date.now().toString(),
        image: photo,
        pestName,
        pestFamily,
        cropType,
        severity,
        date: new Date().toISOString(),
        latitude: selectedLocation?.latitude || 0,
        longitude: selectedLocation?.longitude || 0,
        address: address || 'Localização não disponível'
      };

      const saved = await AsyncStorage.getItem('@pest_analyses');
      const analyses = saved ? JSON.parse(saved) : [];
      analyses.unshift(newAnalysis);
      await AsyncStorage.setItem('@pest_analyses', JSON.stringify(analyses));
      router.back();
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      Alert.alert('Erro', 'Não foi possível salvar a análise');
    }
  };

  // UI de permissão de câmera
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Precisamos da permissão para usar a câmera</Text>
        <Button onPress={requestPermission} title="Conceder permissão" />
      </View>
    );
  }

  function flipCamera(): void {
    setFacing((prevFacing) => (prevFacing === 'back' ? 'front' : 'back'));
  }

  // Render da câmera ou do formulário
  return (
    <View style={styles.container}>
      {!photo ? (
      <CameraView style={styles.camera} back-facing={facing} ref={cameraRef}>
      <View style={styles.cameraControls}>
        {/* Botão de flip */}
        <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
          <MaterialIcons name="flip-camera-ios" size={28} color="white" />
        </TouchableOpacity>

        {/* Botão de captura */}
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        {/* Placeholder para centralizar */}
        <View style={styles.placeholderView} />
      </View>
    </CameraView>
      ) : (
        <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 100 }}>
          <Image source={{ uri: photo }} style={styles.previewImage} />

          <Text style={styles.sectionTitle}>Selecionar Praga</Text>
          {loadingPests ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
          <Picker
            selectedValue={pestName}
            onValueChange={(value: string) => {
              const sel = pests.find((p: any) => p.commonName === value);
              if (sel) {
                setPestName(sel.commonName);
                setPestFamily(sel.family || '');
              } else {
                setPestName('');
                setPestFamily('');
              }
            }}
            style={styles.picker}
          >
            <Picker.Item label="-- Selecione a praga --" value="" />
            {pests.map((p: any, idx: number) => (
              <Picker.Item key={idx} label={p.commonName} value={p.commonName} />
            ))}
          </Picker>

          )}

          <TextInput
            style={styles.input}
            placeholder="Família (preenchido automaticamente)"
            value={pestFamily}
            onChangeText={setPestFamily}
          />

          <Text style={styles.sectionTitle}>Tipo de Cultura*</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Milho, Soja..."
            value={cropType}
            onChangeText={setCropType}
          />

          <Text style={styles.sectionTitle}>Localização</Text>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => setMapModalVisible(true)}
          >
            <Text style={styles.locationText}>
              {address || "Toque para selecionar a localização"}
            </Text>
            <MaterialIcons name="location-on" size={24} color="#2E7D32" />
          </TouchableOpacity>
          
          <Modal
            animationType="slide"
            transparent={false}
            visible={mapModalVisible}
            onRequestClose={() => setMapModalVisible(false)}
          >
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
                followsUserLocation={true}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    title="Local selecionado"
                    pinColor="#2E7D32"
                  />
                )}
              </MapView>
              
              <View style={styles.mapControls}>
                <TouchableOpacity
                  style={styles.myLocationButton}
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  <MaterialIcons 
                    name="my-location" 
                    size={24} 
                    color={isLoadingLocation ? "#ccc" : "#2E7D32"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    if (selectedLocation) {
                      setLocation({
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                        altitude: 0,
                        accuracy: 0,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null,
                      });
                      setMapModalVisible(false);
                    } else {
                      Alert.alert('Nenhuma localização selecionada', 'Por favor, selecione uma localização no mapa ou use sua localização atual');
                    }
                  }}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          <Text style={styles.sectionTitle}>Gravidade</Text>
          <View style={styles.severityContainer}>
            {['Baixa', 'Média', 'Alta'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  severity === level && styles[`severity${level as 'Baixa' | 'Média' | 'Alta'}`]
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text style={[
                  styles.severityButtonText,
                  severity === level && styles.activeSeverityText
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.retryButton} onPress={() => setPhoto(null)}>
              <Text style={styles.retryButtonText}>Tirar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveAnalysis}>
              <Text style={styles.saveButtonText}>Salvar Análise</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  captureButton: {
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 50,
    padding: 4,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholderView: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#2E7D32',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  locationText: {
    flex: 1,
    color: '#333',
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  severityButton: {
    padding: 12,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  severityBaixa: {
    backgroundColor: '#4CAF50',
  },
  severityMédia: {
    backgroundColor: '#FFC107',
  },
  severityAlta: {
    backgroundColor: '#F44336',
  },
  severityButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  activeSeverityText: {
    color: 'white',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  retryButtonText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myLocationButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});