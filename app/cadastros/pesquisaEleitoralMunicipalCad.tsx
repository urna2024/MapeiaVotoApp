import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';

export default function PesquisaEleitoralCadScreen() {
  const [dataEntrevista, setDataEntrevista] = useState('');
  const [uf, setUf] = useState('');
  const { id } = useLocalSearchParams();
  const [municipio, setMunicipio] = useState('');
  const [votoIndeciso, setVotoIndeciso] = useState(false);
  const [votoBrancoNulo, setVotoBrancoNulo] = useState(false);
  const [sugestaoMelhoria, setSugestaoMelhoria] = useState('');
  const [idCandidatoPrefeito, setIdCandidatoPrefeito] = useState<number | undefined>();
  const [idCandidatoVereador, setIdCandidatoVereador] = useState<number | undefined>();
  const [idStatus, setIdStatus] = useState<number | undefined>();
  const [statusOptions, setStatusOptions] = useState([]);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | undefined>();

  // Campos do entrevistado
  const [entrevistadoNomeCompleto, setEntrevistadoNomeCompleto] = useState('');
  const [entrevistadoDataNascimento, setEntrevistadoDataNascimento] = useState('');
  const [entrevistadoUf, setEntrevistadoUf] = useState('');
  const [entrevistadoMunicipio, setEntrevistadoMunicipio] = useState('');
  const [entrevistadoCelular, setEntrevistadoCelular] = useState('');
  const [entrevistadoIdGenero, setEntrevistadoIdGenero] = useState<number | undefined>();
  const [entrevistadoIdNivelEscolaridade, setEntrevistadoIdNivelEscolaridade] = useState<number | undefined>();
  const [entrevistadoIdRendaFamiliar, setEntrevistadoIdRendaFamiliar] = useState<number | undefined>();

  const [prefeitos, setPrefeitos] = useState([]);
  const [vereadores, setVereadores] = useState([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [municipiosEntrevista, setMunicipiosEntrevista] = useState<string[]>([]);
  const [municipiosEntrevistado, setMunicipiosEntrevistado] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (date: string) => {
    const formattedDate = date.replace(/\D/g, '').slice(0, 8);
    if (formattedDate.length >= 5) return `${formattedDate.slice(0, 2)}/${formattedDate.slice(2, 4)}/${formattedDate.slice(4)}`;
    else if (formattedDate.length >= 3) return `${formattedDate.slice(0, 2)}/${formattedDate.slice(2)}`;
    else return formattedDate;
  };

  const formatDateForApi = (date: string) => {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`; 
  };

  useEffect(() => {
    fetchUfs();
    fetchStatusOptions();
    getUserInfo();
  }, []);

  useEffect(() => {
    if (uf) fetchMunicipiosEntrevista();
  }, [uf]);

  useEffect(() => {
    if (entrevistadoUf) fetchMunicipiosEntrevistado();
  }, [entrevistadoUf]);

  useEffect(() => {
    if (uf && municipio) {
      fetchPrefeitos();
      fetchVereadores();
    }
  }, [uf, municipio]);

  const fetchUfs = async () => {
    try {
      const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const siglas = response.data.map((estado: any) => estado.sigla);
      setUfs(siglas);
    } catch (error) {
      console.error("Erro ao buscar estados:", error);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const response = await axios.get('http://ggustac-002-site1.htempurl.com/api/Candidato/tipoStatus');
      setStatusOptions(response.data);
    } catch (error) {
      console.error("Erro ao buscar status:", error);
    }
  };

  const fetchMunicipiosEntrevista = async () => {
    try {
      const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const nomesMunicipios = response.data.map((municipio: any) => municipio.nome);
      setMunicipiosEntrevista(nomesMunicipios);
    } catch (error) {
      console.error("Erro ao buscar municípios da entrevista:", error);
    }
  };

  const fetchMunicipiosEntrevistado = async () => {
    try {
      const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${entrevistadoUf}/municipios`);
      const nomesMunicipios = response.data.map((municipio: any) => municipio.nome);
      setMunicipiosEntrevistado(nomesMunicipios);
    } catch (error) {
      console.error("Erro ao buscar municípios do entrevistado:", error);
    }
  };

  const fetchPrefeitos = async () => {
    try {
      const response = await axios.get(`http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/prefeitos?uf=${uf}&municipio=${municipio}`);
      setPrefeitos(response.data);
    } catch (error) {
      console.error("Erro ao buscar prefeitos:", error);
    }
  };

  const fetchVereadores = async () => {
    try {
      const response = await axios.get(`http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/vereadores?uf=${uf}&municipio=${municipio}`);
      setVereadores(response.data);
    } catch (error) {
      console.error("Erro ao buscar vereadores:", error);
    }
  };

  const getUserInfo = async () => {
    const userName = await AsyncStorage.getItem('userName');
    const userId = await AsyncStorage.getItem('userId');
    setUserName(userName || '');
    setUserId(userId ? Number(userId) : undefined);
  };

  const handleCadastro = async () => {
    if (!dataEntrevista || !uf || !municipio || idCandidatoPrefeito === undefined || idCandidatoVereador === undefined) {
      Alert.alert("Erro", "Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const payload = {
        request: {},
        dataEntrevista: formatDateForApi(dataEntrevista),
        uf,
        municipio,
        votoIndeciso,
        votoBrancoNulo,
        sugestaoMelhoria,
        idCandidatoPrefeito,
        idCandidatoVereador,
        idUsuario: userId,
        idStatus,
        entrevistado: [
          {
            nomeCompleto: entrevistadoNomeCompleto,
            dataNascimento: formatDateForApi(entrevistadoDataNascimento),
            uf: entrevistadoUf,
            municipio: entrevistadoMunicipio,
            celular: entrevistadoCelular,
            idGenero: entrevistadoIdGenero,
            idNivelEscolaridade: entrevistadoIdNivelEscolaridade,
            idRendaFamiliar: entrevistadoIdRendaFamiliar
          }
        ]
      };

      await axios.post('http://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      Alert.alert("Sucesso", `Pesquisa Eleitoral ${id ? "atualizada" : "cadastrada"} com sucesso.`);
      router.push('/(tabs)/pesquisaEleitoralMunicipalList' as never);
    } catch (error: any) {
      console.error("Erro ao cadastrar/atualizar candidato:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados do candidato.");
    } finally {
      setLoading(false);
    }
  };

  const handleDataEntrevistaChange = (text: string) => {
    setDataEntrevista(formatDate(text));
  };

  const handleEntrevistadoDataNascimentoChange = (text: string) => {
    setEntrevistadoDataNascimento(formatDate(text));
  };

  return (
  
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Pesquisa Eleitoral Municipal</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <Text>ID do Usuário: {userId}</Text>
          <Text>Nome do Usuário: {userName}</Text>

          <TextInput
            style={styles.input}
            placeholder="Data da Entrevista (dd/mm/aaaa)"
            value={dataEntrevista}
            onChangeText={handleDataEntrevistaChange}
            maxLength={10}
            keyboardType="numeric"
          />

<Text>Estado (UF):</Text>
          <Picker
            selectedValue={uf}
            style={styles.picker}
            onValueChange={(itemValue: string) => setUf(itemValue)}
          >
            <Picker.Item label="Selecione o Estado" value="" />
            {ufs.map((estado) => (
              <Picker.Item key={estado} label={estado} value={estado} />
            ))}
          </Picker>

          <Text>Município:</Text>
          <Picker
            selectedValue={municipio}
            style={styles.picker}
            onValueChange={(itemValue: string) => setMunicipio(itemValue)}
          >
            <Picker.Item label="Selecione o Município" value="" />
            {municipiosEntrevista.map((cidade) => (
              <Picker.Item key={cidade} label={cidade} value={cidade} />
            ))}
          </Picker>

          <Text>Status:</Text>
          <Picker
            selectedValue={idStatus}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdStatus(itemValue)}
          >
            <Picker.Item label="Selecione o Status" value={undefined} />
            {statusOptions.map((status: any) => (
              <Picker.Item key={status.id} label={status.nome} value={status.id} />
            ))}
          </Picker>

          <Text>Prefeito:</Text>
          <Picker
            selectedValue={idCandidatoPrefeito}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdCandidatoPrefeito(itemValue)}
          >
            <Picker.Item label="Selecione o Prefeito" value={undefined} />
            {prefeitos.map((prefeito: any) => (
              <Picker.Item key={prefeito.id} label={prefeito.nomeCompleto} value={prefeito.id} />
            ))}
          </Picker>

          <Text>Vereador:</Text>
          <Picker
            selectedValue={idCandidatoVereador}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdCandidatoVereador(itemValue)}
          >
            <Picker.Item label="Selecione o Vereador" value={undefined} />
            {vereadores.map((vereador: any) => (
              <Picker.Item key={vereador.id} label={vereador.nomeCompleto} value={vereador.id} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Nome Completo do Entrevistado"
            value={entrevistadoNomeCompleto}
            onChangeText={setEntrevistadoNomeCompleto}
          />
          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento do Entrevistado (dd/mm/aaaa)"
            value={entrevistadoDataNascimento}
            onChangeText={handleEntrevistadoDataNascimentoChange}
            maxLength={10}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Celular do Entrevistado"
            value={entrevistadoCelular}
            onChangeText={setEntrevistadoCelular}
          />
          <Text>UF do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoUf}
            style={styles.picker}
            onValueChange={(itemValue: string) => setEntrevistadoUf(itemValue)}
          >
            <Picker.Item label="Selecione o Estado" value="" />
            {ufs.map((estado) => (
              <Picker.Item key={estado} label={estado} value={estado} />
            ))}
          </Picker>
          <Text>Município do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoMunicipio}
            style={styles.picker}
            onValueChange={(itemValue: string) => setEntrevistadoMunicipio(itemValue)}
          >
            <Picker.Item label="Selecione o Município" value="" />
            {municipiosEntrevistado.map((cidade) => (
              <Picker.Item key={cidade} label={cidade} value={cidade} />
            ))}
          </Picker>

          <Text>Gênero do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoIdGenero}
            style={styles.picker}
            onValueChange={(itemValue: number) => setEntrevistadoIdGenero(itemValue)}
          >
            <Picker.Item label="Selecione o Gênero" value={undefined} />
            
            <Picker.Item label="Masculino" value={1} />
            <Picker.Item label="Feminino" value={2} />
          </Picker>

          <Text>Nível de Escolaridade do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoIdNivelEscolaridade}
            style={styles.picker}
            onValueChange={(itemValue: number) => setEntrevistadoIdNivelEscolaridade(itemValue)}
          >
            <Picker.Item label="Selecione o Nível de Escolaridade" value={undefined} />
            
            <Picker.Item label="Prefiro não informar" value={1} />
            <Picker.Item label="Ensino Fundamental Incompleto" value={2} />
            <Picker.Item label="Ensino Fundamental Completo" value={3} />
            <Picker.Item label="Ensino Médio Incompleto" value={4} />
            <Picker.Item label="Ensino Médio Completo" value={5} />
            <Picker.Item label="Ensino Superior Incompleto" value={6} />
            <Picker.Item label="Ensino Superior Completo" value={7} />
            <Picker.Item label="Pós-graduação" value={8} />
            <Picker.Item label="Mestrado" value={9} />
            <Picker.Item label="Doutorado" value={10} />
          </Picker>

          <Text>Renda Familiar do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoIdRendaFamiliar}
            style={styles.picker}
            onValueChange={(itemValue: number) => setEntrevistadoIdRendaFamiliar(itemValue)}
          >
            <Picker.Item label="Selecione a Renda Familiar" value={undefined} />
            <Picker.Item label="Prefiro não informar" value={2} />
            <Picker.Item label="Até 1 salário mínimo" value={2} />
            <Picker.Item label="De 1 a 2 salários mínimos" value={3} />
            <Picker.Item label="De 2 a 3 salários mínimos" value={4} />
            <Picker.Item label="De 3 a 4 salários mínimos" value={5} />
            <Picker.Item label="De 4 a 5 salários mínimos" value={6} />
            <Picker.Item label="Mais de 5 salários mínimos" value={7} />
          </Picker>
          <View style={styles.switchContainer}>
            <Text>Voto Indeciso</Text>
            <Switch
              value={votoIndeciso}
              onValueChange={(value) => setVotoIndeciso(value)}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text>Voto em Branco ou Nulo</Text>
            <Switch
              value={votoBrancoNulo}
              onValueChange={(value) => setVotoBrancoNulo(value)}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Sugestão de Melhoria"
            value={sugestaoMelhoria}
            onChangeText={setSugestaoMelhoria}
          />

          <Button title="Cadastrar Pesquisa" onPress={handleCadastro} />
          <View style={{ paddingBottom: 120 }} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
