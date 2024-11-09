import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/FontAwesome';

interface PesquisaEleitoral {
  id: number;
  dataEntrevista: string;
  uf: string;
  municipio: string;
  idStatus: number;
  statusNome: string;
  entrevistado: string;
}

export default function PesquisaEleitoralListScreen() {
  const router = useRouter();
  const [pesquisas, setPesquisas] = useState<PesquisaEleitoral[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPesquisas = async () => {
      try {
        const response = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/dadosBasicos', {
          headers: {
            'Accept': 'text/plain',
          },
        });
        setPesquisas(response.data);
      } catch (error) {
        console.error("Erro ao buscar pesquisas eleitorais:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados das pesquisas eleitorais.");
      } finally {
        setLoading(false);
      }
    };

    fetchPesquisas();
  }, []);

  const renderItem = ({ item }: { item: PesquisaEleitoral }) => (
    <View style={styles.pesquisaContainer}>
      <View style={styles.pesquisaInfo}>
        <Text style={styles.entrevistado}>{item.entrevistado}</Text>
        <Text>Data da Entrevista: {new Date(item.dataEntrevista).toLocaleDateString()}</Text>
        <Text>UF: {item.uf}</Text>
        <Text>Município: {item.municipio}</Text>
        <Text>Status: {item.statusNome}</Text>
      </View>

      <TouchableOpacity style={styles.iconContainer} onPress={() => router.push(`/pesquisaEleitoral/detalhes?id=${item.id}` as never)}>
        <Icon name="eye" size={24} color="blue" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando pesquisas eleitorais...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Pesquisas Eleitorais</Text>
      
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/cadastros/pesquisaEleitoralMunicipalCad' as never)}>
        <Text style={styles.addButtonText}>Adicionar Nova Pesquisa</Text>
      </TouchableOpacity>

      <FlatList
        data={pesquisas}
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
  },
  list: {
    paddingBottom: 20,
  },
  pesquisaContainer: {
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
  pesquisaInfo: {
    flex: 1,
    marginRight: 10,
  },
  entrevistado: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
  addButton: {
    backgroundColor: '#1a2b52', // Cor do botão
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff', // Texto em branco
    fontSize: 16,
    fontWeight: 'bold',
  },
});

