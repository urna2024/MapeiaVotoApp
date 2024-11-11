import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Status {
  id: number;
  nome: string;
}

interface Perfil {
  id: number;
  nome: string;
}

export default function UsuarioCadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [idStatus, setIdStatus] = useState<number | undefined>(undefined);
  const [idPerfilUsuario, setIdPerfilUsuario] = useState<number | undefined>(undefined);
  const [precisaTrocarSenha, setPrecisaTrocarSenha] = useState(true);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [perfilOptions, setPerfilOptions] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get('https://ggustac-002-site1.htempurl.com/api/Usuario/tipoStatus', {
          headers: { 'Accept': '*/*' },
        });
        setStatusOptions(response.data);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
      }
    };

    const fetchPerfilOptions = async () => {
      try {
        const response = await axios.get('https://ggustac-002-site1.htempurl.com/api/Usuario/tipoPerfilUsuario', {
          headers: { 'Accept': '*/*' },
        });
        setPerfilOptions(response.data);
      } catch (error) {
        console.error("Erro ao buscar perfis:", error);
      }
    };

    fetchStatusOptions();
    fetchPerfilOptions();
  }, []);

  useEffect(() => {
    const fetchUsuarioData = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await axios.get(`https://ggustac-002-site1.htempurl.com/api/Usuario/${id}/dadosCompletos`, {
            headers: { 'Accept': 'application/json' },
          });
          const userData = response.data;
          setNomeUsuario(userData.nomeUsuario);
          setEmail(userData.email);
          setSenha(userData.senha);
          setIdStatus(userData.idStatus);
          setIdPerfilUsuario(userData.idPerfilUsuario);
          setPrecisaTrocarSenha(userData.precisaTrocarSenha);
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsuarioData();
  }, [id]);

  const handleCadastro = async () => {
    if (!nomeUsuario || !email || !senha || idStatus === undefined || idPerfilUsuario === undefined) {
      Alert.alert("Erro", "Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      if (!userId || !token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const endpoint = id
        ? `https://ggustac-002-site1.htempurl.com/api/Usuario/${id}`
        : 'https://ggustac-002-site1.htempurl.com/api/Usuario';

      const method = id ? 'put' : 'post';

      const payload = {
        nomeUsuario,
        email,
        senha,
        idStatus,
        idPerfilUsuario,
        precisaTrocarSenha: id ? precisaTrocarSenha : true,
        idUsuarioOperacao: Number(userId)
      };

      const response = await axios[method](endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      Alert.alert("Sucesso", id ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.");
      router.push('/(tabs)/usuarioList' as never);
    } catch (error: any) {
      Alert.alert("Erro", "Erro ao cadastrar/atualizar usuário. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id ? 'Editar Usuário' : 'Cadastro de Usuário'}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário"
            value={nomeUsuario}
            onChangeText={setNomeUsuario}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#1a2b52" style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          <Text>Status:</Text>
          <Picker
            selectedValue={idStatus}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdStatus(Number(itemValue))}
          >
            <Picker.Item label="Selecione o Status" value={undefined} />
            {statusOptions.map((status) => (
              <Picker.Item key={status.id} label={status.nome} value={status.id} />
            ))}
          </Picker>

          <Text>Perfil de Usuário:</Text>
          <Picker
            selectedValue={idPerfilUsuario}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdPerfilUsuario(Number(itemValue))}
          >
            <Picker.Item label="Selecione o Perfil" value={undefined} />
            {perfilOptions.map((perfil) => (
              <Picker.Item key={perfil.id} label={perfil.nome} value={perfil.id} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.registerButton} onPress={handleCadastro}>
            <Text style={styles.registerButtonText}>{id ? "Salvar Alterações" : "Cadastrar Usuário"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/usuarioList' as never)}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 22,
  },
  input: {
    width: '100%',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
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
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
  },
  registerButton: {
    backgroundColor: '#1a2b52',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#1a2b52',
    borderRadius: 5,
    margin: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
