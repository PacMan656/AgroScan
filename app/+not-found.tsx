import { Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function NotFound() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Página não encontrada!</Text>
      <Link href="/(auth)/login" style={{ marginTop: 20, color: 'blue' }}>
        Voltar para o início
      </Link>
    </View>
  );
}