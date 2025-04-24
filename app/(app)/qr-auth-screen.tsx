import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ScanCameraAuthScreen() {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      // Simulação de chamada API - substitua pela sua lógica real
      const res = await fetch('https://api.seuapp.com/auth/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionUrl: data }),
      });
      
      const { token } = await res.json();

      if (token) {
        await AsyncStorage.setItem('@user_token', token);
        Alert.alert('Sucesso', 'Autenticação realizada!');
        router.replace('/home');
      } else {
        Alert.alert('Falhou', 'QR‑Code inválido ou expirado.');
        setScanned(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível completar a autenticação.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permissão de câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Sem acesso à câmera.</Text>
        <Button title="Permitir acesso à câmera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Validando QR‑Code...</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <Button 
          title="Alternar Câmera" 
          onPress={toggleCameraFacing} 
        />
        
        {scanned && !loading && (
          <Button 
            title="Escanear Novamente" 
            onPress={() => setScanned(false)} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: 'white',
    fontSize: 16,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
});