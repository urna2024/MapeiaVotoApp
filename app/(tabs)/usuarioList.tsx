import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Usuario {
  id: number;
  nomeUsuario: string;
  email: string;
  idStatus: number;
  statusNome: string;
  perfilusuario: string;
}

interface Status {
  id: number;
  nome: string;
}

export default function UsuarioListScreen() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('http://ggustac-002-site1.htempurl.com/api/Usuario/dadosBasicos', {
          headers: {
            'Accept': 'text/plain',
          },
        });
        setUsuarios(response.data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados dos usuários.");
      } finally {
        setLoading(false);
      }
    };

    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get('http://ggustac-002-site1.htempurl.com/api/Usuario/tipoStatus', {
          headers: {
            'Accept': '*/*',
          },
        });
        setStatusOptions(response.data);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
        Alert.alert("Erro", "Não foi possível carregar os status.");
      }
    };

    fetchUsuarios();
    fetchStatusOptions();
  }, []);

  const mudarStatus = async (id: number, novoStatus: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      console.log("Token do usuário logado:", token);

      await axios.patch(
        `http://ggustac-002-site1.htempurl.com/api/Usuario/${id}/mudarStatus`,
        JSON.stringify(novoStatus),
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
            'Authorization': `Bearer ${token}`, 
          },
        }
      );

      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario.id === id 
            ? { ...usuario, idStatus: novoStatus, statusNome: statusOptions.find(status => status.id === novoStatus)?.nome || usuario.statusNome } 
            : usuario
        )
      );

      Alert.alert("Sucesso", "Status atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status do usuário.");
    }
  };

  const renderItem = ({ item }: { item: Usuario }) => (
    <View style={styles.userContainer}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nomeUsuario}</Text>
        <Text>Email: {item.email}</Text>
        <Text>Perfil: {item.perfilusuario}</Text>

        <View style={styles.statusContainer}>
          <Text>Status:</Text>
          <Picker
            selectedValue={item.idStatus}
            style={styles.picker}
            onValueChange={(novoStatus: number) => mudarStatus(item.id, novoStatus)}
          >
            {statusOptions.map((status) => (
              <Picker.Item key={status.id} label={status.nome} value={status.id} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.iconContainer} onPress={() => router.push(`/cadastros/usuarioCad?id=${item.id}` as never)}>
        <Icon name="eye" size={24} color="blue" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuários</Text>
      
      <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/cadastros/usuarioCad' as never)}>
        <Text style={styles.registerButtonText}>Cadastrar Novo Usuário</Text>
      </TouchableOpacity>

      <FlatList
        data={usuarios}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
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
    alignItems: 'center' 
  },
  list: {
    paddingBottom: 20,
  },
  userContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  picker: {
    height: 40,
    width: 150,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    paddingHorizontal: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#1a2b52', 
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
  },
});
