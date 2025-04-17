import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const PragaDetailsScreen = () => {
  const router = useRouter();
  const { praga } = router.query; // Pegando os parâmetros passados pela navegação

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes da Praga</Text>
      <Text style={styles.detailText}>Nome Comum: {praga?.nome_comum}</Text>
      <Text style={styles.detailText}>Nome Científico: {praga?.nome_cientifico}</Text>
      <Text style={styles.detailText}>Descrição: {praga?.descricao}</Text>
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
  detailText: {
    fontSize: 18,
    marginVertical: 10,
    color: '#333',
  },
});

export default PragaDetailsScreen;
