// components/HamburgerMenu.js
import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../backend/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

import { ReactNode } from 'react';

interface HamburgerMenuProps {
  children: ReactNode;
}

export default function HamburgerMenu({ children }: HamburgerMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openMenu = () => {
    setIsOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  interface CloseMenuCallback {
    (callback?: () => void): void;
  }

  const closeMenu = (callback?: () => void): Promise<void> => {
    return new Promise((resolve) => {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false);
        callback?.();
        resolve();
      });
    });
  };
  

  const handleLogout = async () => {
    try {
      await closeMenu();
  
      // Firebase logout (se aplicável)
      await signOut(auth);
  
      // Limpa dados locais
      await AsyncStorage.multiRemove(['@user_token', '@user_data']);
  
      // Redireciona após um leve delay
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } catch (error) {
      console.error('Erro no logout:', error);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    }
  };
  

  const handleNavigate = (route: Parameters<typeof router.push>[0]): void => {
    closeMenu(() => {
      router.push(route);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>AgroScan</Text>
      </View>

      {/* Main Content - Envolvido em View para garantir z-index */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* Overlay com condicional de renderização */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={() => closeMenu()}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer com z-index elevado */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: slideAnim }] },
          isOpen && styles.drawerOpen,
        ]}
      >
        <MenuButton
          icon="person-circle-outline"
          label="Perfil"
          onPress={() => handleNavigate('/perfilUsuario')}
        />
        <MenuButton
          icon="qr-code-outline"
          label="Autenticar"
          onPress={() => handleNavigate('/qr-auth-screen')}
        />
        <MenuButton
          icon="hardware-chip-outline"
          label="Arduino (Bluetooth)"
          onPress={() => handleNavigate('/arduino')}
        />
        <MenuButton
          icon="business-outline"
          label="Propriedade"
          onPress={() => handleNavigate('/propriedade')}
        />
        <MenuButton
  icon="list"
  label="Histórico da Armadilha"
  onPress={() => handleNavigate('/historico-armadilha')}
/>

        <MenuButton
          icon="logout"
          label="Sair"
          onPress={handleLogout}
        />


      </Animated.View>
    </View>
  );
}

// Reusable menu item


interface MenuButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'] | 'logout';
  label: string;
  onPress: () => void;
}

const MenuButton = ({ icon, label, onPress }: MenuButtonProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    {icon === 'logout' ? (
      <MaterialIcons name="logout" size={24} color="#333" />
    ) : (
      <Ionicons name={icon} size={24} color="#333" />
    )}
    <Text style={styles.itemText}>{label}</Text>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Importante para o posicionamento absoluto dos filhos
  },
  contentContainer: {
    flex: 1,
    zIndex: 0, // Garante que o conteúdo fique atrás do drawer quando aberto
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    zIndex: 10, // Header acima de tudo
  },
  menuButton: { 
    marginRight: 16,
    zIndex: 11, // Garante que o botão do menu seja clicável
  },
  title: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 5, // Abaixo do drawer mas acima do conteúdo
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 80, // Aumentado para evitar conflito com a header bar
    paddingHorizontal: 20,
    zIndex: 20, // Drawer no topo da hierarquia
  },
  drawerOpen: {
    elevation: 20, // Para Android (sombra)
    shadowColor: '#000', // Para iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  itemText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#333',
  },
});