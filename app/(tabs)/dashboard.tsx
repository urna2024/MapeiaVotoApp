import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator, Dimensions, View } from 'react-native';
import axios from 'axios';
import { BarChart, PieChart } from 'react-native-chart-kit';

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

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    resultadosPrefeitos: [],
    resultadosVereadores: [],
    votosIndecisos: 0,
    percentualIndecisos: 0,
    votosBrancosNulos: 0,
    percentualBrancosNulos: 0,
    resultadosPorRendaFamiliar: [],
    resultadosPorGenero: [],
    resultadosPorNivelEscolaridade: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const prefData = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/prefeitos');
      const verData = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/vereadores');
      const indecisosData = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/indecisos-brancos-nulos');
      const rendaData = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/renda-familiar');
      const generoData = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/genero');
      const escolaridadeData = await axios.get('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/resultados/nivel-escolaridade');

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
      console.error("Erro ao buscar dados: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" />;
  }

  // Preparando dados para gráficos
  const prefeitoData = {
    labels: data.resultadosPrefeitos.map((item) => item.candidatoPrefeito),
    datasets: [
      {
        data: data.resultadosPrefeitos.map((item) => item.totalVotos),
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // Verde
      },
    ],
  };

  const vereadorData = {
    labels: data.resultadosVereadores.map((item) => item.candidatoVereador),
    datasets: [
      {
        data: data.resultadosVereadores.map((item) => item.totalVotos),
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`, // Azul
      },
    ],
  };

  const generoData = data.resultadosPorGenero.map((item, index) => ({
    name: item.genero,
    population: item.totalVotos,
    color: index % 2 === 0 ? '#3498db' : '#95a5a6', // Azul e cinza claro
    legendFontColor: '#34495e',
    legendFontSize: 12,
  }));

  const rendaFamiliarData = data.resultadosPorRendaFamiliar.map((item, index) => ({
    name: item.rendaFamiliar,
    population: item.totalVotos,
    color: index % 2 === 0 ? '#3498db' : '#95a5a6',
    legendFontColor: '#34495e',
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Resultados Prefeitos</Text>
        <BarChart
          data={prefeitoData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Resultados Vereadores</Text>
        <BarChart
          data={vereadorData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Distribuição por Gênero</Text>
        <PieChart
          data={generoData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Distribuição por Renda Familiar</Text>
        <PieChart
          data={rendaFamiliarData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#f5f6fa',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // Verde claro para outros gráficos
  labelColor: (opacity = 1) => `rgba(52, 73, 94, ${opacity})`, // Cinza escuro
  style: {
    borderRadius: 8,
  },
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#27ae60',
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ecf0f1', // Cinza claro
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e', // Cinza escuro
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;
