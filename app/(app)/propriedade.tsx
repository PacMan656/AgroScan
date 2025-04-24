import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const Propriedade = () => {
  const [nomePropriedade, setNomePropriedade] = useState('');
  const [proprietario, setProprietario] = useState('');
  const [endereco, setEndereco] = useState('');
  const [localizacao, setLocalizacao] = useState<Location.LocationObjectCoords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const obterLocalizacao = async () => {
    setLoadingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permissão de localização é necessária.');
      setLoadingLocation(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocalizacao(location.coords);
    setLoadingLocation(false);
  };

  const salvarPropriedade = () => {
    if (!nomePropriedade || !proprietario || !endereco || !localizacao) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos e obtenha a localização.');
      return;
    }

    // Aqui você pode salvar no Firebase
    Alert.alert('Sucesso', 'Propriedade cadastrada com sucesso!');
    // Limpar os campos
    setNomePropriedade('');
    setProprietario('');
    setEndereco('');
    setLocalizacao(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Propriedade</Text>

      <TextInput
        placeholder="Nome da propriedade"
        style={styles.input}
        value={nomePropriedade}
        onChangeText={setNomePropriedade}
      />

      <TextInput
        placeholder="Nome do proprietário"
        style={styles.input}
        value={proprietario}
        onChangeText={setProprietario}
      />

      <TextInput
        placeholder="Endereço completo"
        style={styles.input}
        value={endereco}
        onChangeText={setEndereco}
      />

      <TouchableOpacity style={styles.button} onPress={obterLocalizacao} disabled={loadingLocation}>
        {loadingLocation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Obter Localização Atual</Text>
        )}
      </TouchableOpacity>

      {localizacao && (
        <Text style={styles.coords}>
          Latitude: {localizacao.latitude.toFixed(6)} | Longitude: {localizacao.longitude.toFixed(6)}
        </Text>
      )}

      <TouchableOpacity style={styles.buttonSave} onPress={salvarPropriedade}>
        <Text style={styles.buttonText}>Salvar Propriedade</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Propriedade;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  button: {
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonSave: {
    height: 50,
    backgroundColor: '#34A853',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coords: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
});
