import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons } from '@expo/vector-icons';
import pragas from '../app/data/pragas_200.json'; // Verifique o caminho correto do JSON

// ATENÇÃO: para produção, não exponha a chave da API no cliente.
const GOOGLE_API_KEY = 'AIzaSyBldjwDIlAYd4wp43LqVur1xBio_z0IK2I';

export default function CameraIdentifyScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permissão de Câmera',
            message: 'O aplicativo precisa acessar sua câmera',
            buttonNeutral: 'Perguntar Depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK'
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      return permissionResult.granted;
    }
  };

  const handleImage = async (pickerResult: any) => {
    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const asset = pickerResult.assets[0];
      setImageUri(asset.uri);
      setError(null);

      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        let base64Image = asset.base64 
          ? asset.base64 
          : await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
          
        if (base64Image.startsWith('data:image')) {
          base64Image = base64Image.split(',')[1];
        }

        await handleIdentifyWithGoogleAI(base64Image);
      } else {
        const filename = `${FileSystem.documentDirectory}offline-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: asset.uri, to: filename });
        Alert.alert('Sem internet', 'Imagem salva para análise posterior.');
      }
    }
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      Alert.alert('Permissão necessária', 'Precisamos da permissão da câmera para identificar as pragas.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      await handleImage(result);
    } catch (err) {
      setError('Erro ao capturar a imagem');
      console.error('Image picker error:', err);
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      await handleImage(result);
    } catch (err) {
      setError('Erro ao selecionar a imagem');
      console.error('Library picker error:', err);
    }
  };

  const buscarDetalhesDaPraga = (nomeDetectado: string) => {
    const normalizado = nomeDetectado.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return pragas.find(p =>
      p.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(normalizado) ||
      p.nomeCientifico.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(normalizado)
    );
  };

  const handleIdentifyWithGoogleAI = async (base64Image: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;
      const body = {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
          },
        ],
      };

      const response = await fetch(visionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log("Resposta da API:", data);

      if (data.error) {
        setError(`Erro na API: ${data.error.message || 'Erro desconhecido'}`);
        return;
      }

      if (data.responses && data.responses[0].labelAnnotations && data.responses[0].labelAnnotations.length > 0) {
        const nomeDetectadoGoogle = data.responses[0].labelAnnotations[0].description;
        const pragaEncontrada = buscarDetalhesDaPraga(nomeDetectadoGoogle);

        if (pragaEncontrada) {
          setResult(formatarDetalhes(pragaEncontrada));
        } else {
          setResult(`Praga identificada: ${nomeDetectadoGoogle}\n\n⚠️ Nenhum dado adicional encontrado no banco local.`);
        }
      } else {
        setError('Nenhuma informação foi retornada pela API do Google.');
      }
    } catch (err) {
      setError('Erro ao identificar a praga com o Google AI.');
      console.error('Erro na chamada do Google Cloud Vision:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarDetalhes = (praga: any) => {
    return `🐛 ${praga.nome_comum} (${praga.nome_cientifico})\n\n📖 Descrição: ${praga.descricao}\n\n💥 Danos: ${praga.danos}\n\n🧪 Controle: ${praga.metodos_controle}\n\n🌾 Cultura: ${praga.cultura}`;
  };

  const retryAnalysis = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Identificador de Pragas Agrícolas</Text>
      {!imageUri ? (
        <>
          <TouchableOpacity style={styles.captureButton} onPress={pickImageFromCamera}>
            <MaterialIcons name="photo-camera" size={24} color="white" />
            <Text style={styles.buttonText}>Capturar Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={pickImageFromLibrary}>
            <MaterialIcons name="photo-library" size={24} color="white" />
            <Text style={styles.buttonText}>Selecionar da Galeria</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.secondaryButton} onPress={pickImageFromCamera}>
              <Text style={styles.secondaryButtonText}>Tirar Outra Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={retryAnalysis}>
              <Text style={styles.secondaryButtonText}>Recomeçar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analisando imagem...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={24} color="#D32F2F" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado da Análise:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
      <Text style={styles.tips}>
        Dica: Fotografe a praga de perto, com boa iluminação e foco.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
    textAlign: 'center'
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500'
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0'
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    width: '48%'
  },
  secondaryButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '500'
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%'
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 10
  },
  resultContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    elevation: 2
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  tips: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center'
  }
});
