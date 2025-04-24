import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="InitialScreen">
      <Stack.Screen name="InitialScreen" options={{ headerShown: false }} />
      <Stack.Screen 
        name="(auth)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(app)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="analysis-detail/[id]" 
        options={{ title: 'Detalhes da Análise' }} 
      />
      <Stack.Screen 
        name="pragaDetails" 
        options={{ title: 'Detalhes da Praga' }} 
      />
    </Stack>
  );
}