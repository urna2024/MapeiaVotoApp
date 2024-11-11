import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import axios from 'axios';

interface ResultadoPrefeito {
  candidatoPrefeito: string;
  totalVotos: number;
  percentualVotos: number;
}

interface ResultadoVereador {
  candidatoVereador: string;
  totalVotos: number;
  percentualVotos: number;
}

interface ResultadoRendaFamiliar {
  rendaFamiliar: string;
  totalVotos: number;
  percentualVotos: number;
}

interface ResultadoGenero {
  genero: string;
  totalVotos: number;
  percentualVotos: number;
}

interface ResultadoEscolaridade {
  nivelEscolaridade: string;
  totalVotos: number;
  percentualVotos: number;
}

interface DashboardData {
  resultadosPrefeitos: ResultadoPrefeito[];
  resultadosVereadores: ResultadoVereador[];
  votosIndecisos: number;
  percentualIndecisos: number;
  votosBrancosNulos: number;
  percentualBrancosNulos: number;
  resultadosPorRendaFamiliar: ResultadoRendaFamiliar[];
  resultadosPorGenero: ResultadoGenero[];
  resultadosPorNivelEscolaridade: ResultadoEscolaridade[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [prefData, verData, indecisosData, rendaData, generoData, escolaridadeData] = await Promise.all([
        axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/prefeitos'),
        axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/vereadores'),
        axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/indecisos-brancos-nulos'),
        axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/renda-familiar'),
        axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/genero'),
        axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/nivel-escolaridade'),
      ]);

      setData({
        resultadosPrefeitos: prefData.data.resultadosPrefeitos,
        resultadosVereadores: verData.data.resultadosVereadores,
        votosIndecisos: indecisosData.data.votosIndecisos,
        percentualIndecisos: indecisosData.data.percentualIndecisos,
        votosBrancosNulos: indecisosData.data.votosBrancosNulos,
        percentualBrancosNulos: indecisosData.data.percentualBrancosNulos,
        resultadosPorRendaFamiliar: rendaData.data.resultadosPorRendaFamiliar,
        resultadosPorGenero: generoData.data.resultadosPorGenero,
        resultadosPorNivelEscolaridade: escolaridadeData.data.resultadosPorNivelEscolaridade,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao buscar dados: ", errorMessage);
      Alert.alert("Erro", "Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Não há dados disponíveis para exibir.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Resultados Prefeitos</Text>
      {data.resultadosPrefeitos.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardText}>Candidato: {item.candidatoPrefeito}</Text>
          <Text style={styles.cardText}>Total de Votos: {item.totalVotos}</Text>
          <Text style={styles.cardText}>Percentual: {item.percentualVotos}%</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Resultados Vereadores</Text>
      {data.resultadosVereadores.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardText}>Candidato: {item.candidatoVereador}</Text>
          <Text style={styles.cardText}>Total de Votos: {item.totalVotos}</Text>
          <Text style={styles.cardText}>Percentual: {item.percentualVotos}%</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Distribuição por Gênero</Text>
      {data.resultadosPorGenero.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardText}>Gênero: {item.genero}</Text>
          <Text style={styles.cardText}>Total de Votos: {item.totalVotos}</Text>
          <Text style={styles.cardText}>Percentual: {item.percentualVotos}%</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Distribuição por Renda Familiar</Text>
      {data.resultadosPorRendaFamiliar.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardText}>Renda: {item.rendaFamiliar}</Text>
          <Text style={styles.cardText}>Total de Votos: {item.totalVotos}</Text>
          <Text style={styles.cardText}>Percentual: {item.percentualVotos}%</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ecf0f1',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34495e',
    marginVertical: 10,
    marginTop: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: '#34495e',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default Dashboard;
