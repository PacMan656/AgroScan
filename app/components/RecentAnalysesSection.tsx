import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function RecentAnalysesSection() {
  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Análises Recentes</Text>
        <TouchableOpacity onPress={() => router.push('/HistoryScreen')}>
          <Text style={styles.seeAll}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Análises */}
      <View style={styles.analysesList}>
        {/* Análise 1 */}
        <View style={styles.analysisItem}>
          <Text style={styles.pestName}>Lagarta-do-cartucho</Text>
          <View style={styles.analysisDetails}>
            <Text style={[styles.severity, styles.highSeverity]}>Alta</Text>
            <Text style={styles.crop}>Milho</Text>
            <Text style={styles.date}>15/06/2023</Text>
          </View>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Análise 2 */}
        <View style={styles.analysisItem}>
          <Text style={styles.pestName}>Ferrugem Asiática</Text>
          <View style={styles.analysisDetails}>
            <Text style={[styles.severity, styles.mediumSeverity]}>Média</Text>
            <Text style={styles.crop}>Soja</Text>
            <Text style={styles.date}>10/06/2023</Text>
          </View>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Análise 3 */}
        <View style={styles.analysisItem}>
          <Text style={styles.pestName}>Ácaro-rajado</Text>
          <View style={styles.analysisDetails}>
            <Text style={[styles.severity, styles.lowSeverity]}>Baixa</Text>
            <Text style={styles.crop}>Feijão</Text>
            <Text style={styles.date}>05/06/2023</Text>
          </View>
        </View>
      </View>

      {/* Dica do Dia */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>Dica do Dia</Text>
        <Text style={styles.tipText}>
          Para prevenir a Lagarta-do-cartucho, realize o monitoramento semanal e considere o uso de controle biológico com Bacillus thuringiensis em infestações iniciais.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  analysesList: {
    marginBottom: 16,
  },
  analysisItem: {
    paddingVertical: 10,
  },
  pestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  analysisDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severity: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 12,
    color: '#FFF',
  },
  highSeverity: {
    backgroundColor: '#F44336',
  },
  mediumSeverity: {
    backgroundColor: '#FFC107',
  },
  lowSeverity: {
    backgroundColor: '#4CAF50',
  },
  crop: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 4,
  },
  tipContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});