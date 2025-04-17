import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}> {/* Oculta todos os cabeçalhos */}
      <Stack.Screen name="index" /> {/* Tela inicial (sem título) */}
      <Stack.Screen name="login" />  {/* Tela de Login */}
      <Stack.Screen name="HomeScreen" /> {/* Home */}
      <Stack.Screen name="agrofit" /> {/* Análises */}
      <Stack.Screen name="camera" /> {/* Identificação */}
    </Stack>
  );
}