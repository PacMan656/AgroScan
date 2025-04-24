import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const onboardingSlides = [
  {
    id: '1',
    title: 'Identifique pragas facilmente',
    description: 'Use sua câmera para identificar pragas agrícolas em tempo real',
    image: require('../assets/images/onboarding1.jpg'),
    color1: '#4CAF50',
    color2: '#8BC34A'
  },
  {
    id: '2',
    title: 'Soluções personalizadas',
    description: 'Receba recomendações de tratamento específicas para cada praga detectada',
    image: require('../assets/images/onboarding2.jpg'),
    color1: '#FF9800',
    color2: '#FFC107'
  },
  {
    id: '3',
    title: 'Monitoramento contínuo',
    description: 'Acompanhe a saúde da sua plantação e receba alertas preventivos',
    image: require('../assets/images/onboarding3.jpg'),
    color1: '#2196F3',
    color2: '#03A9F4'
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleFinish = async () => {
    await AsyncStorage.setItem('@onboarding_seen', 'true');
    router.replace('/login');
  };

  const goToNextSlide = async () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await handleFinish();
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = async () => {
    await handleFinish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[onboardingSlides[currentSlide].color1, onboardingSlides[currentSlide].color2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>AgroScan</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Pular</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Image
            source={onboardingSlides[currentSlide].image}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{onboardingSlides[currentSlide].title}</Text>
            <Text style={styles.description}>{onboardingSlides[currentSlide].description}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Pagination */}
          <View style={styles.pagination}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentSlide ? styles.activeDot : null
                ]}
              />
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentSlide > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={goToPrevSlide}>
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
              <Text style={styles.nextButtonText}>
                {currentSlide === onboardingSlides.length - 1 ? 'Começar' : 'Próximo'}
              </Text>
              <Feather name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  skip: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  footer: {
    marginTop: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 10,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    flex: 1,
    maxWidth: 200,
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});
