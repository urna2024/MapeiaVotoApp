import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TrocarSenhaScreen() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleTrocarSenha = async () => {
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      if (!userId) {
        Alert.alert('Erro', 'ID do usuário não encontrado.');
        return;
      }

      const response = await axios.post(
        'https://ggustac-002-site1.htempurl.com/api/Seguranca/TrocarSenha',
        {
          id: Number(userId),
          senha,
          novaSenha
        },
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      console.log('Resposta da API:', response.data);
      Alert.alert('Sucesso', 'Senha alterada com sucesso.');

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');

      router.replace({ pathname: '/' } as never);
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/urna.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Trocar Senha</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Digite sua senha atual"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#1a2b52" style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Digite sua nova senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry={!showNewPassword}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Icon name={showNewPassword ? 'eye-slash' : 'eye'} size={20} color="#1a2b52" style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a2b52" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleTrocarSenha}>
          <Text style={styles.buttonText}>Trocar Senha</Text>
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
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2b52',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    color: '#000',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#1a2b52',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
