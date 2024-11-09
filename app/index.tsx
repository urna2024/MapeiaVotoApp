import React, { useState } from 'react';
import { Text, View, TextInput, Button, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://ggustac-002-site1.htempurl.com/api/Seguranca/Login',
        { email, senha },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { precisaTrocarSenha, id: userId } = response.data;

      if (precisaTrocarSenha) {
        await AsyncStorage.setItem('userId', String(userId));
        router.replace('/trocarSenha/trocarSenha' as never);
      } else if (response.data.token) {
        const { token } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', String(userId));
        router.replace('/(tabs)/principal' as never);
      } else {
        console.log('Token não recebido, credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/urna.png')} style={styles.image} />
      <Text style={styles.header}>Sistema de Pesquisa de Votos</Text>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail..."
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a senha..."
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E2A78', 
  },
  image: {
    width: 150,
    height: 100,
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderColor: '#FFF',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#000',
  },
  button: {
    width: '100%',
    backgroundColor: '#1A47C4',
    borderRadius: 6,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
