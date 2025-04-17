import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function AnalysisCard({ analysis }) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/analysis-detail/${analysis.id}`)}
      activeOpacity={0.9}
    >
      {/* Imagem com overlay gradiente */}
      <Image 
        source={{ uri: analysis.image }} 
        style={styles.cardImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradientOverlay}
      />
      
      {/* Badge de severidade */}
      <View style={[
        styles.severityBadge,
        analysis.severity === 'Alta' && { backgroundColor: '#F44336' },
        analysis.severity === 'Média' && { backgroundColor: '#FFC107' },
        analysis.severity === 'Baixa' && { backgroundColor: '#4CAF50' },
      ]}>
        <Text style={styles.severityText}>{analysis.severity}</Text>
      </View>
      
      {/* Informações principais */}
      <View style={styles.cardContent}>
        <Text style={styles.pestName} numberOfLines={1}>{analysis.pestName}</Text>
        <Text style={styles.pestFamily}>{analysis.pestFamily}</Text>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="local-offer" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.cropType}>{analysis.cropType}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.location} numberOfLines={1}>{analysis.address}</Text>
        </View>
      </View>
      
      {/* Data da análise */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>
          {new Date(analysis.date).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  severityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  pestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  pestFamily: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cropType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
  },
});