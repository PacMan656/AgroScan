import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, FlatList, TouchableOpacity,
  StyleSheet, PermissionsAndroid, Platform, Alert, TextInput
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { addTrapEvent } from '../../hooks/useTrapHistory';

export default function TelaBluetooth() {
  const [devices, setDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [command, setCommand] = useState('');

  useEffect(() => {
    async function setup() {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ]);
      }
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        Alert.alert(
          'Bluetooth Desativado',
          'Por favor, ative o Bluetooth nas configurações do dispositivo.'
        );
      }
    }
    setup();
  }, []);

  const listDevices = async () => {
    const bonded = await RNBluetoothClassic.getBondedDevices();
    setDevices(bonded);
  };

  const connectToDevice = async (device: any) => {
    try {
      const connected = await RNBluetoothClassic.connectToDevice(device.address);
      if (connected) {
        setConnectedDevice(device);
        startListening(device);
        Alert.alert('Conectado', `Dispositivo ${device.name}`);
      }
    } catch (e) {
      Alert.alert('Erro', 'Erro ao conectar: ' + (e as Error).message);
    }
  };

  const startListening = async (device: any) => {
    device.onDataReceived((data: any) => {
      const message = data.data.trim();
      console.log('📥 Recebido:', message);
      if (message) {
        Alert.alert('Arduino', message);
        addTrapEvent(message); // salvar no histórico
      }
    });
  };

  const sendCommand = async () => {
    if (connectedDevice && command.trim() !== '') {
      await connectedDevice.write(command.trim() + '\n');
      setCommand('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conectar ao Arduino Uno</Text>

      {!connectedDevice ? (
        <>
          <Button title="Listar dispositivos" onPress={listDevices} />
          <FlatList
            data={devices}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceButton}
                onPress={() => connectToDevice(item)}
              >
                <Text>{item.name || 'Desconhecido'}</Text>
                <Text>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.connected}>✅ Conectado a: {connectedDevice.name}</Text>
          <TextInput
            placeholder="Digite comando (ex: reset)"
            value={command}
            onChangeText={setCommand}
            style={styles.input}
          />
          <Button title="Enviar comando" onPress={sendCommand} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  connected: { fontSize: 16, color: 'green', marginBottom: 10 },
  input: {
    borderColor: '#ccc', borderWidth: 1, padding: 8, borderRadius: 6,
    marginVertical: 10,
  },
  deviceButton: {
    padding: 10, marginVertical: 5,
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
  },
});
