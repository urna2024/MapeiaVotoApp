import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PerfilScreen = ({ navigation }) => {
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    const fetchNomeUsuario = async () => {
      try {
        const nome = await AsyncStorage.getItem('nomeUsuario'); 
        if (nome) setNomeUsuario(nome);
      } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
      }
    };

    fetchNomeUsuario();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token'); 
      navigation.replace('Login'); 
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Olá, {nomeUsuario}!</Text>
      <Button 
        title="Sair do Sistema" 
        onPress={logout} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default PerfilScreen;
