import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView, Switch, TouchableOpacity } from 'react-native';
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
  const [generos, setGeneros] = useState([]);
  const [nivelEscolaridadeOptions, setNivelEscolaridadeOptions] = useState([]);
  const [rendaFamiliarOptions, setRendaFamiliarOptions] = useState([]);
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

  const handleDataEntrevistaChange = (text: string) => {
    setDataEntrevista(formatDate(text));
  };

  const handleEntrevistadoDataNascimentoChange = (text: string) => {
    setEntrevistadoDataNascimento(formatDate(text));
  };

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchUfs();
        await fetchStatusOptions();
        await fetchGeneros();
        await fetchNiveisEscolaridade();
        await fetchRendaFamiliar();
        getUserInfo();
        if (isEditing) {
          await fetchPesquisaData();
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchMunicipiosEntrevistado = async () => {
    try {
      const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${entrevistadoUf}/municipios`);
      const nomesMunicipios = response.data.map((municipio: any) => municipio.nome);
      setMunicipiosEntrevistado(nomesMunicipios);
    } catch (error) {
      console.error("Erro ao buscar municípios do entrevistado:", error);
    }
  };

  // useEffect(() => {
  //   if (municipiosEntrevistado.length > 0 && entrevistadoMunicipio) {
  //     setEntrevistadoMunicipio(entrevistadoMunicipio);
  //   }
  // }, [municipiosEntrevistado, entrevistadoMunicipio]);

  useEffect(() => {
    if (entrevistadoUf) {
      fetchMunicipiosEntrevistado();
    }
  }, [entrevistadoUf]);


  const fetchPesquisaData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/${id}`);
      const pesquisa = response.data;

      console.log("Dados da pesquisa:", pesquisa);

      setDataEntrevista(new Date(pesquisa.dataEntrevista).toLocaleDateString());
      setUf(pesquisa.uf);
      setMunicipio(pesquisa.municipio);
      setVotoIndeciso(pesquisa.votoIndeciso);
      setVotoBrancoNulo(pesquisa.votoBrancoNulo);
      setSugestaoMelhoria(pesquisa.sugestaoMelhoria);
      setIdCandidatoPrefeito(pesquisa.idCandidatoPrefeito);
      setIdCandidatoVereador(pesquisa.idCandidatoVereador);
      setIdStatus(pesquisa.idStatus);

      const entrevistado = pesquisa.entrevistado[0];
      if (entrevistado) {
        setEntrevistadoNomeCompleto(entrevistado.nomeCompleto);
        setEntrevistadoDataNascimento(new Date(entrevistado.dataNascimento).toLocaleDateString());
        setEntrevistadoUf(entrevistado.uf);
        setEntrevistadoMunicipio(entrevistado.municipio);
        setEntrevistadoCelular(entrevistado.celular);
        setEntrevistadoIdGenero(entrevistado.idGenero);
        setEntrevistadoIdNivelEscolaridade(entrevistado.idNivelEscolaridade);
        setEntrevistadoIdRendaFamiliar(entrevistado.idRendaFamiliar);
      } else {
        console.warn("Dados do entrevistado estão vazios.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados da pesquisa:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da pesquisa.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (municipiosEntrevistado.length > 0 && entrevistadoMunicipio) {
      setEntrevistadoMunicipio(entrevistadoMunicipio);
    }
  }, [municipiosEntrevistado, entrevistadoMunicipio]);


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
      const response = await axios.get('https://ggustac-002-site1.htempurl.com/api/Candidato/tipoStatus');
      setStatusOptions(response.data);
    } catch (error) {
      console.error("Erro ao buscar status:", error);
    }
  };

  const fetchGeneros = async () => {
    try {
      const response = await axios.get('https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/generos');
      setGeneros(response.data);
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
    }
  };

  const fetchNiveisEscolaridade = async () => {
    try {
      const response = await axios.get('https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/nivelEscolaridade');
      setNivelEscolaridadeOptions(response.data);
    } catch (error) {
      console.error("Erro ao buscar níveis de escolaridade:", error);
    }
  };

  const fetchRendaFamiliar = async () => {
    try {
      const response = await axios.get('https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/rendaFamiliar');
      setRendaFamiliarOptions(response.data);
    } catch (error) {
      console.error("Erro ao buscar renda familiar:", error);
    }
  };

  const fetchPrefeitos = async () => {
    try {
      const response = await axios.get(`https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/prefeitos?uf=${uf}&municipio=${municipio}`);
      setPrefeitos(response.data);
    } catch (error) {
      console.error("Erro ao buscar prefeitos:", error);
    }
  };

  const fetchVereadores = async () => {
    try {
      const response = await axios.get(`https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral/vereadores?uf=${uf}&municipio=${municipio}`);
      setVereadores(response.data);
    } catch (error) {
      console.error("Erro ao buscar vereadores:", error);
    }
  };

  useEffect(() => {
    if (uf) {
      fetchMunicipiosEntrevista();
    }
  }, [uf]);

  useEffect(() => {
    if (uf && municipio) {
      fetchPrefeitos();
      fetchVereadores();
    }
  }, [uf, municipio]);

  const fetchMunicipiosEntrevista = async () => {
    try {
      const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const nomesMunicipios = response.data.map((municipio: any) => municipio.nome);
      setMunicipiosEntrevista(nomesMunicipios);
    } catch (error) {
      console.error("Erro ao buscar municípios da entrevista:", error);
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
            idRendaFamiliar: entrevistadoIdRendaFamiliar,
          },
        ],
      };

      await axios.post('https://ggustac-002-site1.htempurl.com/api/PesquisaEleitoral', payload, {
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

  const handleVoltar = () => {
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Pesquisa Eleitoral Municipal</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>

          <TextInput
            style={styles.input}
            placeholder="Data da Entrevista (dd/mm/aaaa)"
            value={dataEntrevista}
            onChangeText={handleDataEntrevistaChange}
            maxLength={10}
            keyboardType="numeric"
            editable={!isEditing}
          />

          <Text>Estado (UF):</Text>
          <Picker
            selectedValue={uf}
            style={styles.picker}
            onValueChange={(itemValue: string) => setUf(itemValue)}
            enabled={!isEditing}
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
            enabled={!isEditing}
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
            enabled={!isEditing}
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
            enabled={!isEditing}
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
            enabled={!isEditing}
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
            editable={!isEditing}
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento do Entrevistado (dd/mm/aaaa)"
            value={entrevistadoDataNascimento}
            onChangeText={handleEntrevistadoDataNascimentoChange}
            maxLength={10}
            keyboardType="numeric"
            editable={!isEditing}
          />

          <TextInput
            style={styles.input}
            placeholder="Celular do Entrevistado"
            value={entrevistadoCelular}
            onChangeText={setEntrevistadoCelular}
            editable={!isEditing}
          />

          <Text>UF do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoUf}
            style={styles.picker}
            onValueChange={(itemValue: string) => setEntrevistadoUf(itemValue)}
            enabled={!isEditing}
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
            onValueChange={(itemValue: string) => {
              setEntrevistadoMunicipio(itemValue);
              console.log("Município selecionado:", itemValue);
            }}
            enabled={!isEditing}
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
            enabled={!isEditing}
          >
            <Picker.Item label="Selecione o Gênero" value={undefined} />
            {generos.map((genero: any) => (
              <Picker.Item key={genero.id} label={genero.nome} value={genero.id} />
            ))}
          </Picker>

          <Text>Nível de Escolaridade do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoIdNivelEscolaridade}
            style={styles.picker}
            onValueChange={(itemValue: number) => setEntrevistadoIdNivelEscolaridade(itemValue)}
            enabled={!isEditing}
          >
            <Picker.Item label="Selecione o Nível de Escolaridade" value={undefined} />
            {nivelEscolaridadeOptions.map((nivel: any) => (
              <Picker.Item key={nivel.id} label={nivel.nome} value={nivel.id} />
            ))}
          </Picker>

          <Text>Renda Familiar do Entrevistado:</Text>
          <Picker
            selectedValue={entrevistadoIdRendaFamiliar}
            style={styles.picker}
            onValueChange={(itemValue: number) => setEntrevistadoIdRendaFamiliar(itemValue)}
            enabled={!isEditing}
          >
            <Picker.Item label="Selecione a Renda Familiar" value={undefined} />
            {rendaFamiliarOptions.map((renda: any) => (
              <Picker.Item key={renda.id} label={renda.nome} value={renda.id} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Sugestão de Melhoria"
            value={sugestaoMelhoria}
            onChangeText={setSugestaoMelhoria}
            editable={!isEditing}
          />

          <View style={styles.switchContainer}>
            <Text>Voto Indeciso</Text>
            <Switch
              value={votoIndeciso}
              onValueChange={(value) => setVotoIndeciso(value)}
              disabled={isEditing}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text>Voto em Branco ou Nulo</Text>
            <Switch
              value={votoBrancoNulo}
              onValueChange={(value) => setVotoBrancoNulo(value)}
              disabled={isEditing}
            />
          </View>

          {isEditing ? (
            <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.registerButton} onPress={handleCadastro}>
              <Text style={styles.registerButtonText}>Cadastrar Pesquisa</Text>
            </TouchableOpacity>
          )}

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
    textAlign: 'center',
    marginTop: 22,
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
