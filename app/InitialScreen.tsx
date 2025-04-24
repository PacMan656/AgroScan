// app/InitialScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../backend/firebase/firebaseConfig';
import { router } from 'expo-router';

export default function InitialScreen() {
  useEffect(() => {
    const load = async () => {
      const seen = await AsyncStorage.getItem('@onboarding_seen');
      if (!seen) {
        router.replace('/onboarding');
        return;
      }

      onAuthStateChanged(auth, user => {
        if (user) router.replace('/home');
        else router.replace('/login');
      });
    };

    load();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}
