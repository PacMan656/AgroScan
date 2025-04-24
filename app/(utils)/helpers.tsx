import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function  Helpers() {
  const abrirManual = async () => {
    const url = 'https://www.seusite.com/manual.pdf'; // link externo do PDF
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o manual.');
    }
  };

  const enviarEmail = () => {
    Linking.openURL('mailto:suporte@agroscan.com?subject=Ajuda com o app AgroScan');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Central de Ajuda</Text>

      <View style={styles.card}>
        <Ionicons name="camera" size={24} color="#34a853" />
        <Text style={styles.cardText}>
          📸 Para melhores resultados na identificação, tire a foto da praga em ambiente iluminado e com o foco nítido.
        </Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="location-sharp" size={24} color="#fbbc05" />
        <Text style={styles.cardText}>
          📍 Ative o GPS do seu dispositivo para registrar a localização da análise corretamente.
        </Text>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="lightbulb-outline" size={24} color="#ff7043" />
        <Text style={styles.cardText}>
          💡 Use o app na horizontal quando quiser visualizar melhor o mapa de infestações.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={abrirManual}>
        <Text style={styles.buttonText}>📥 Baixar Manual do Usuário</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={enviarEmail}>
        <Text style={styles.linkText}>💬 Fale com o suporte</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    color: '#34a853',
  },
});
