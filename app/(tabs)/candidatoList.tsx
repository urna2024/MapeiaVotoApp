import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Candidato {
  id: number;
  nomeCompleto: string;
  nomeUrna: string;
  uf: string;
  municipio: string;
  dataNascimento: string;
  idStatus: number;
  statusNome: string;
}

interface Status {
  id: number;
  nome: string;
}

export default function CandidatoListScreen() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCandidatos = async () => {
      try {
        const response = await axios.get('http://ggustac-002-site1.htempurl.com/api/Candidato/dadosBasicos', {
          headers: { 'Accept': 'text/plain' },
        });
        setCandidatos(response.data);
      } catch (error) {
        console.error("Erro ao buscar candidatos:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados dos candidatos.");
      } finally {
        setLoading(false);
      }
    };

    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get('http://ggustac-002-site1.htempurl.com/api/Candidato/tipoStatus', {
          headers: { 'Accept': '*/*' },
        });
        setStatusOptions(response.data);
      } catch (error) {
        console.error("Erro ao buscar status:", error);
        Alert.alert("Erro", "Não foi possível carregar os status.");
      }
    };

    fetchCandidatos();
    fetchStatusOptions();
  }, []);

  const mudarStatus = async (id: number, novoStatus: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      await axios.patch(
        `http://ggustac-002-site1.htempurl.com/api/Candidato/${id}/mudarStatus`,
        JSON.stringify(novoStatus),
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setCandidatos((prevCandidatos) =>
        prevCandidatos.map((candidato) =>
          candidato.id === id
            ? { ...candidato, idStatus: novoStatus, statusNome: statusOptions.find(status => status.id === novoStatus)?.nome || candidato.statusNome }
            : candidato
        )
      );

      Alert.alert("Sucesso", "Status atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status do candidato.");
    }
  };

  const renderItem = ({ item }: { item: Candidato }) => (
    <View style={styles.candidateContainer}>
      <View style={styles.candidateInfo}>
        <Text style={styles.candidateName}>{item.nomeCompleto}</Text>
        <Text>Nome de Urna: {item.nomeUrna}</Text>
        <Text>UF: {item.uf}</Text>
        <Text>Município: {item.municipio}</Text>
        <Text>Data de Nascimento: {new Date(item.dataNascimento).toLocaleDateString()}</Text>
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

      <TouchableOpacity style={styles.iconContainer} onPress={() => router.push(`/cadastros/candidatoCad?id=${item.id}` as never)}>
        <Icon name="eye" size={24} color="blue" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando candidatos...</Text>
      </View>
    );
  }

  //teste de build
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Candidatos</Text>
      <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/cadastros/candidatoCad' as never)}>
        <Text style={styles.registerButtonText}>Cadastrar Novo Candidato</Text>
      </TouchableOpacity>

      <FlatList
        data={candidatos}
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
    textAlign: 'center',
    marginTop: 22,
  },
  list: {
    paddingBottom: 20,
  },
  candidateContainer: {
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
  candidateInfo: {
    flex: 1,
    marginRight: 10,
  },
  candidateName: {
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
