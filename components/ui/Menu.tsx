// components/Menu.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Menu() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@user_token');
    router.replace('/login');
  };

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile')}>
        <Ionicons name="person-circle-outline" size={24} color="white" />
        <Text style={styles.menuText}>Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.menuText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  menuText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
});

