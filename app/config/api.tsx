import { Platform } from 'react-native';

const getLocalhost = () => {
  // IP do seu computador manual ou dinamicamente resolvido
  if (Platform.OS === 'android') {
    return '192.168.0.100'; // substitua pelo IP real da sua rede local
  } else {
    return 'localhost';
  }
};

export const API_URL = `http://${getLocalhost()}:8000`;
