import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Button,Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function CameraScreen() {
  const cameraRef = useRef(null); // Adicionando a referência da câmera
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [pestName, setPestName] = useState('');
  const [pestFamily, setPestFamily] = useState('');
  const [cropType, setCropType] = useState('');
  const [severity, setSeverity] = useState('Média');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão para localização negada');
        return;
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhoto(photo.uri);
        
        // Obter localização atual
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
        
        // Obter endereço aproximado
        const address = await Location.reverseGeocodeAsync(location.coords);
        if (address[0]) {
          const street = address[0].street || 'Rua não identificada';
          const district = address[0].district || 'Bairro não identificado';
          setAddress(`${street}, ${district}`);
        }
      } catch (error) {
        console.error('Erro ao capturar foto:', error);
        alert('Ocorreu um erro ao capturar a foto');
      }
    }
  };

  const saveAnalysis = async () => {
    if (!pestName || !cropType) {
      alert('Por favor, preencha pelo menos o nome da praga e o tipo de cultura');
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
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        address: address || 'Localização não disponível'
      };

      const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
      const analyses = savedAnalyses ? JSON.parse(savedAnalyses) : [];
      analyses.unshift(newAnalysis);
      
      await AsyncStorage.setItem('@pest_analyses', JSON.stringify(analyses));
      router.back();
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      alert('Erro ao salvar a análise');
    }
  };

  const flipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Precisamos da permissão para usar a câmera</Text>
        <Button onPress={requestPermission} title="Conceder permissão" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photo ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <MaterialIcons name="flip-camera-ios" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholderView} />
          </View>
        </CameraView>
      ) : (
        <ScrollView style={styles.formContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          
          <Text style={styles.sectionTitle}>Informações da Praga</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da praga*"
            value={pestName}
            onChangeText={setPestName}
          />
          <TextInput
            style={styles.input}
            placeholder="Família da praga"
            value={pestFamily}
            onChangeText={setPestFamily}
          />
          
          <Text style={styles.sectionTitle}>Informações Agrícolas</Text>
          <TextInput
            style={styles.input}
            placeholder="Tipo de cultura*"
            value={cropType}
            onChangeText={setCropType}
          />
          
          <Text style={styles.sectionTitle}>Localização</Text>
          <Text style={styles.locationText}>{address || "Carregando localização..."}</Text>
          
          <Text style={styles.sectionTitle}>Gravidade</Text>
          <View style={styles.severityContainer}>
            {['Baixa', 'Média', 'Alta'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  severity === level && styles[`severity${level}`]
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
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.retryButtonText}>Tirar Novamente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveAnalysis}
            >
              <Text style={styles.saveButtonText}>Salvar Análise</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  locationText: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
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
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  retryButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});