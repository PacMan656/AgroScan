import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { getTrapHistory, clearTrapHistory } from '../../hooks/useTrapHistory';

export default function HistoricoArmadilha() {
  const [dados, setDados] = useState<{ time: string; message: string }[]>([]);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    const history = await getTrapHistory();
    setDados(history);
  };

  const limpar = async () => {
    await clearTrapHistory();
    carregarHistorico();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Histórico da Armadilha</Text>

      <FlatList
        data={dados}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.msg}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vazio}>Sem registros.</Text>}
      />

      <Button title="Limpar Histórico" color="#D32F2F" onPress={limpar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 5 },
  msg: { fontSize: 16 },
  time: { fontSize: 12, color: '#666' },
  vazio: { marginTop: 20, textAlign: 'center', color: '#999' },
});
