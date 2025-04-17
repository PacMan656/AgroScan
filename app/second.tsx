import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function SecondScreen() {
  const router = useRouter();
  const mensagem = "Olá, eu vim da Tela 2!";

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center"}}>
      <Text style={{ fontSize:22, marginBottom:16 }}>Tela 2: Second</Text>
      <Button
        title="Ir para a Tela 3 (enviando parâmetro)"
        onPress={() => router.push("/fourth")}
      />
    </View>
  );
}
