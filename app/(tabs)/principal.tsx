import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Principal() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Confirmação de Logout',
      'Você realmente deseja sair do sistema?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            
            router.push('/'); 
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="sign-out" size={24} color="#1a2b52" />
      </TouchableOpacity>

      <Text style={styles.title}>Bem-vindo ao MapeiaVoto</Text>

      <Image
        source={require('../../assets/images/urna.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>Escolha uma das opções abaixo:</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/candidatoList')}>
        <Text style={styles.buttonText}>Ver Lista de Candidatos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/usuarioList')}>
        <Text style={styles.buttonText}>Gerenciar Usuários</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/pesquisaEleitoralMunicipalList')}>
        <Text style={styles.buttonText}>Iniciar Pesquisa Eleitoral</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/dashboard')}>
        <Text style={styles.buttonText}>Estatísticas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a2b52',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6c757d',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1a2b52',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
