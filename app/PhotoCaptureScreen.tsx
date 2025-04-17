import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';

export default function PhotoCaptureScreen() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [captureTime, setCaptureTime] = useState(null);
  const router = useRouter(); // Hook do useRouter
  useEffect(() => {
    (async () => {
      // Solicita permissões ao carregar o componente
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (locationStatus !== 'granted') {
        setErrorMsg('Permissão para acessar a localização foi negada');
        return;
      }
      
      if (cameraStatus !== 'granted') {
        setErrorMsg('Permissão para acessar a câmera foi negada');
        return;
      }
    })();
  }, []);

  const takePicture = async () => {
    try {
      // Captura a imagem
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setCaptureTime(new Date());
        
        // Obtém a localização atual
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
        
        // Obtém o endereço a partir das coordenadas
        let addressResponse = await Location.reverseGeocodeAsync(location.coords);
        if (addressResponse.length > 0) {
          const firstAddress = addressResponse[0];
          const formattedAddress = `${firstAddress.street || ''}, ${firstAddress.number || ''} - ${firstAddress.district || ''}, ${firstAddress.city || ''} - ${firstAddress.region || ''}`;
          setAddress(formattedAddress);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      setErrorMsg('Ocorreu um erro ao capturar a foto ou localização');
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return format(date, 'HH:mm:ss', { locale: ptBR });
  };

  const formatDate = (date) => {
    if (!date) return '--/--/----';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captura de Foto com Localização</Text>
      
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Tirar Foto</Text>
      </TouchableOpacity>
      
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Informações da Captura:</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data:</Text>
              <Text style={styles.infoValue}>{formatDate(captureTime)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hora:</Text>
              <Text style={styles.infoValue}>{formatTime(captureTime)}</Text>
            </View>
            
            {location && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Latitude:</Text>
                  <Text style={styles.infoValue}>{location.latitude.toFixed(6)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Longitude:</Text>
                  <Text style={styles.infoValue}>{location.longitude.toFixed(6)}</Text>
                </View>
              </>
            )}
            
            {address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço:</Text>
                <Text style={[styles.infoValue, { flex: 1 }]}>{address}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'contain',
    backgroundColor: '#ddd',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 90,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});