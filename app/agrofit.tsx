import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const AgrofitScreen = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter(); // Hook do useRouter

  // Sua chave da API
  const apiKey = 'bcf6e9ea-d94a-3bd0-9e9f-65c8a02b91f4'; // Substitua com a chave correta da Embrapa Agrofit

  // Função para buscar dados da API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.cnptia.embrapa.br/agrofit/v1', {
        headers: {
          'Authorization': `Bearer ${apiKey}`, // Passando a chave da API no cabeçalho
        },
      });

      if (response.status === 200) {
        setData(response.data);
      } else {
        setError('Erro ao buscar dados');
      }
    } catch (err) {
      setError('Erro ao buscar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchData();
    } else {
      setError('Chave da API inválida ou não fornecida');
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  const handleNavigateToDetails = (item) => {
    // Navegar para a tela de detalhes passando as informações da praga
    router.push({
      pathname: '/pragaDetails',
      params: { praga: item },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Embrapa Agrofit</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.nome_comum}</Text>
            <Text style={styles.itemText}>Nome Científico: {item.nome_cientifico}</Text>
            <Button
              title="Ver Detalhes"
              onPress={() => handleNavigateToDetails(item)} // Navegação para os detalhes
            />
          </View>
        )}
      />
      <Button title="Atualizar Dados" onPress={fetchData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AgrofitScreen;
