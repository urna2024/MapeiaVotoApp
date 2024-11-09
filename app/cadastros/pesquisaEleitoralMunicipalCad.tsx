import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PesquisaEleitoralCadScreen() {
  const [dataEntrevista, setDataEntrevista] = useState('');
  const [uf, setUf] = useState('');
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
        dataEntrevista,
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
            dataNascimento: entrevistadoDataNascimento,
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

      Alert.alert("Sucesso", "Pesquisa Eleitoral cadastrada com sucesso.");
    } catch (error) {
      console.error("Erro ao cadastrar pesquisa eleitoral:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados da pesquisa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            onChangeText={(text) => setDataEntrevista(formatDate(text))}
            maxLength={10}
            keyboardType="numeric"
          />

          <Text>Estado (UF):</Text>
          <Picker
            selectedValue={uf}
            style={styles.picker}
            onValueChange={(itemValue) => setUf(itemValue)}
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
            onValueChange={(itemValue) => setMunicipio(itemValue)}
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
            onValueChange={(itemValue) => setIdStatus(itemValue)}
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
            onValueChange={(itemValue) => setIdCandidatoPrefeito(itemValue)}
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
            onValueChange={(itemValue) => setIdCandidatoVereador(itemValue)}
          >
            <Picker.Item label="Selecione o Vereador" value={undefined} />
            {vereadores.map((vereador: any) => (
              <Picker.Item key={vereador.id} label={vereador.nomeCompleto} value={vereador.id} />
            ))}
          </Picker>

          <Text>Nome Completo do Entrevistado:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            value={entrevistadoNomeCompleto}
            onChangeText={setEntrevistadoNomeCompleto}
          />

          <Text>Data de Nascimento (dd/mm/aaaa):</Text>
          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento"
            value={entrevistadoDataNascimento}
            onChangeText={(text) => setEntrevistadoDataNascimento(formatDate(text))}
            maxLength={10}
            keyboardType="numeric"
          />

          <Text>UF do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoUf}
            style={styles.picker}
            onValueChange={(itemValue) => setEntrevistadoUf(itemValue)}
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
            onValueChange={(itemValue) => setEntrevistadoMunicipio(itemValue)}
          >
            <Picker.Item label="Selecione o Município" value="" />
            {municipiosEntrevistado.map((cidade) => (
              <Picker.Item key={cidade} label={cidade} value={cidade} />
            ))}
          </Picker>

          <Text>Celular do Entrevistado:</Text>
          <TextInput
            style={styles.input}
            placeholder="Celular"
            value={entrevistadoCelular}
            onChangeText={setEntrevistadoCelular}
            keyboardType="phone-pad"
          />

          <Text>Gênero do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoIdGenero}
            style={styles.picker}
            onValueChange={(itemValue) => setEntrevistadoIdGenero(itemValue)}
          >
            <Picker.Item label="Selecione o Gênero" value={undefined} />
            <Picker.Item label="Masculino" value={1} />
            <Picker.Item label="Feminino" value={2} />
          </Picker>

          <Text>Nível de Escolaridade:</Text>
          <Picker
            selectedValue={entrevistadoIdNivelEscolaridade}
            style={styles.picker}
            onValueChange={(itemValue) => setEntrevistadoIdNivelEscolaridade(itemValue)}
          >
            <Picker.Item label="Selecione o Nível de Escolaridade" value={undefined} />
            <Picker.Item label="Fundamental" value={1} />
            <Picker.Item label="Médio" value={2} />
          </Picker>

          <Text>Renda Familiar:</Text>
          <Picker
            selectedValue={entrevistadoIdRendaFamiliar}
            style={styles.picker}
            onValueChange={(itemValue) => setEntrevistadoIdRendaFamiliar(itemValue)}
          >
            <Picker.Item label="Selecione a Renda Familiar" value={undefined} />
            <Picker.Item label="Até 1 salário mínimo" value={1} />
            <Picker.Item label="De 1 a 3 salários mínimos" value={2} />
          </Picker>

          <Button title="Cadastrar Pesquisa" onPress={handleCadastro} />
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
    marginBottom: 15,
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
});
