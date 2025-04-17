import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dicas from '../assets/dicas.json';
export default function HomeScreen() {
  const router = useRouter();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState(null);

   // Carrega uma dica diferente a cada dia
   useEffect(() => {
    const loadDailyTip = async () => {
      try {
        const today = new Date().toDateString();
        const savedTip = await AsyncStorage.getItem('@daily_tip');
        
        if (savedTip) {
          const { date, tip } = JSON.parse(savedTip);
          if (date === today) {
            setDailyTip(tip);
            return;
          }
        }

        // Seleciona uma dica aleatória baseada no dia do ano (0-364)
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const tipIndex = dayOfYear % dicas.length;
        const newTip = dicas[tipIndex];
        
        await AsyncStorage.setItem('@daily_tip', JSON.stringify({
          date: today,
          tip: newTip
        }));
        
        setDailyTip(newTip);
      } catch (error) {
        console.error('Erro ao carregar dica do dia:', error);
        // Fallback para primeira dica
        setDailyTip(dicas[0]);
      }
    };

    loadDailyTip();
  }, []);
  // Carrega as análises do AsyncStorage (igual ao HistoryScreen)
  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const savedAnalyses = await AsyncStorage.getItem('@pest_analyses');
        if (savedAnalyses) {
          const parsedAnalyses = JSON.parse(savedAnalyses);
          // Ordena por data e pega apenas as 3 mais recentes
          parsedAnalyses.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentAnalyses(parsedAnalyses.slice(0, 3));
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar análises:', error);
        setLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  const quickActions = [
    { id: 1, title: 'Nova Análise', icon: 'camera-alt', color: '#4CAF50', screen: 'CameraScreen' },
    { id: 2, title: 'Histórico', icon: 'history', color: '#2196F3', screen: 'HistoryScreen' },
    { id: 3, title: 'Mapa de Infestações', icon: 'map', color: '#9C27B0', screen: 'InfestationMapScreen' },
    { id: 4, title: 'Recomendações', icon: 'lightbulb', color: '#FF9800', screen: 'Recommendations' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabeçalho com saudação (mantido igual) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bem-vindo de volta,</Text>
            <Text style={styles.userName}>Agricultor</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/PhotoCaptureScreen')}>
            <Image 
              source={require('../assets/images/male.png')} 
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Card de status (mantido igual) */}
        <LinearGradient
          colors={['#2E7D32', '#4CAF50']}
          style={styles.statusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.statusContent}>
            <View>
              <Text style={styles.statusTitle}>Monitoramento Ativo</Text>
              <Text style={styles.statusSubtitle}>{recentAnalyses.length} pragas detectadas recentemente</Text>
            </View>
            <FontAwesome5 name="bug" size={30} color="white" />
          </View>
        </LinearGradient>

        {/* Ações rápidas (mantido igual) */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id} 
              style={[styles.quickAction, { backgroundColor: action.color }]}
              onPress={() => router.push(action.screen)}
            >
              <MaterialIcons name={action.icon} size={28} color="white" />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seção de Análises Recentes (atualizada) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Análises Recentes</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
          
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 20 }} />
        ) : recentAnalyses.length > 0 ? (
          recentAnalyses.map((analysis) => (
            <TouchableOpacity 
              key={analysis.id} 
              style={styles.analysisCard}
              onPress={() => router.push(`/analysis-detail/${analysis.id}`)}
            >
              <View style={styles.analysisInfo}>
                <Text style={styles.pestName}>{analysis.pestName}</Text>
                <Text style={styles.cropText}>{analysis.crop || 'Cultura não especificada'}</Text>
                <Text style={styles.dateText}>
                  {new Date(analysis.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={[
                styles.severityBadge,
                analysis.severity === 'Alta' && { backgroundColor: '#F44336' },
                analysis.severity === 'Média' && { backgroundColor: '#FFC107' },
                analysis.severity === 'Baixa' && { backgroundColor: '#8BC34A' },
              ]}>
                <Text style={styles.severityText}>{analysis.severity}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="search" size={24} color="#9E9E9E" />
            <Text style={styles.emptyText}>Nenhuma análise recente</Text>
          </View>
        )}

        {/* Dicas do dia (mantido igual) */}
        {dailyTip && (
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="sparkles" size={20} color="#FFC107" />
              <Text style={styles.tipTitle}>Dica do Dia: {dailyTip.titulo}</Text>
            </View>
            <Text style={styles.tipText}>{dailyTip.texto}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#616161',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  statusCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  seeAll: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickAction: {
    width: '48%',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  quickActionText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  analysisCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  analysisInfo: {
    flex: 1,
  },
  pestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  cropText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  severityBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
    elevation: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
});