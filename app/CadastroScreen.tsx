import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

export function CadastroScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadastro</Text>
            <TextInput placeholder="Nome" style={styles.input} />
            <TextInput placeholder="Email" style={styles.input} />
            <TextInput placeholder="Senha" secureTextEntry style={styles.input} />
            <Button title="Cadastrar" onPress={() => { }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    input: { width: '100%', borderColor: '#ccc', borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
    title: { fontSize: 24, marginBottom: 20 }
});
