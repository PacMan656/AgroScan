// app/Recommendations.js
import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HamburgerMenu from '../../components/ui/HamburgerMenu'; // Ajuste o caminho conforme necessário

const recommendations: {
  icon: 'water-outline' | 'analytics-outline' | 'leaf-outline' | 'thermometer-outline' | 'bug-outline';
  title: string;
  text: string;
  colors: [string, string, ...string[]];
}[] = [
  {
    icon: 'water-outline',
    title: 'Irrigação Inteligente',
    text: 'Use sensores de umidade para aplicar água somente onde e quando necessário.',
    colors: ['#4facfe', '#00f2fe'],
  },
  {
    icon: 'analytics-outline',
    title: 'Análise de Solo',
    text: 'Faça testes regulares de pH e nutrientes para ajustar fertilizantes.',
    colors: ['#43e97b', '#38f9d7'],
  },
  {
    icon: 'leaf-outline',
    title: 'Poda Preventiva',
    text: 'Remova galhos doentes para reduzir riscos de pragas e melhorar a ventilação.',
    colors: ['#fa709a', '#fee140'],
  },
  {
    icon: 'thermometer-outline',
    title: 'Controle Climático',
    text: 'Monitore a temperatura e a umidade para proteger plantas sensíveis.',
    colors: ['#30cfd0', '#330867'],
  },
  {
    icon: 'bug-outline',
    title: 'Manejo Integrado de Pragas',
    text: 'Combine armadilhas, predadores naturais e aplicações locais de inseticidas.',
    colors: ['#f7971e', '#ffd200'],
  },
];

export default function Recommendations() {
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>Recomendações</Text>
          {recommendations.map(({ icon, title, text, colors }, idx) => (
            <LinearGradient
              key={idx}
              colors={colors}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={icon} size={32} color="white" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{text}</Text>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 20, paddingTop: 10 },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
});
