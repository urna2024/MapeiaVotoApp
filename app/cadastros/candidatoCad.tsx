import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Status {
  id: number;
  nome: string;
}

interface Partido {
  id: number;
  nome: string;
  sigla: string;
}

interface Cargo {
  id: number;
  nome: string;
}

export default function CandidatoCadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeUrna, setNomeUrna] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [uf, setUf] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [foto, setFoto] = useState('');
  const [idStatus, setIdStatus] = useState<number | undefined>(undefined);
  const [idPartido, setIdPartido] = useState<number | undefined>(undefined);
  const [idCargo, setIdCargo] = useState<number | undefined>(undefined);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [partidoOptions, setPartidoOptions] = useState<Partido[]>([]);
  const [cargoOptions, setCargoOptions] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ufs, setUfs] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [statusRes, partidoRes, cargoRes] = await Promise.all([
          axios.get('http://ggustac-002-site1.htempurl.com/api/Candidato/tipoStatus', { headers: { 'Accept': '*/*' } }),
          axios.get('http://ggustac-002-site1.htempurl.com/api/Candidato/tipoPartidoPolitico', { headers: { 'Accept': '*/*' } }),
          axios.get('http://ggustac-002-site1.htempurl.com/api/Candidato/tipoCargoDisputado', { headers: { 'Accept': '*/*' } })
        ]);
        setStatusOptions(statusRes.data);
        setPartidoOptions(partidoRes.data);
        setCargoOptions(cargoRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    const fetchUfs = async () => {
      try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const siglas = response.data.map((estado: any) => estado.sigla);
        setUfs(siglas);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      }
    };

    const fetchCandidatoData = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await axios.get(`http://ggustac-002-site1.htempurl.com/api/Candidato/${id}/dadosCompletos`, {
            headers: { 'Accept': 'application/json' },
          });
          const candidatoData = response.data;

          // Converte a data para o formato DD/MM/YYYY
          const [year, month, day] = candidatoData.dataNascimento.split('T')[0].split('-');
          const formattedDate = `${day}/${month}/${year}`;

          setNomeCompleto(candidatoData.nomeCompleto);
          setNomeUrna(candidatoData.nomeUrna);
          setDataNascimento(formattedDate);
          setUf(candidatoData.uf);
          setMunicipio(candidatoData.municipio);
          setFoto(candidatoData.foto);
          setIdStatus(candidatoData.idStatus);
          setIdPartido(candidatoData.idPartidoPolitico);
          setIdCargo(candidatoData.idCargoDisputado);
        } catch (error) {
          console.error("Erro ao carregar dados do candidato:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOptions();
    fetchUfs();
    fetchCandidatoData();
  }, [id]);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (uf) {
        try {
          const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
          const nomesMunicipios = response.data.map((municipio: any) => municipio.nome);
          setMunicipios(nomesMunicipios);
        } catch (error) {
          console.error("Erro ao buscar municípios:", error);
        }
      }
    };

    fetchMunicipios();
  }, [uf]);

  // Função para adicionar barras automaticamente ao digitar a data de nascimento
  const handleDateChange = (text: string) => {
    let formattedText = text.replace(/\D/g, ''); // Remove caracteres que não são números

    // Adiciona a barra após o dia e o mês
    if (formattedText.length >= 3) {
      formattedText = formattedText.slice(0, 2) + '/' + formattedText.slice(2);
    }
    if (formattedText.length >= 6) {
      formattedText = formattedText.slice(0, 5) + '/' + formattedText.slice(5, 9);
    }

    setDataNascimento(formattedText);
  };

  const handleCadastro = async () => {
    if (!nomeCompleto || !nomeUrna || !dataNascimento || !uf || !municipio || !foto || idStatus === undefined || idPartido === undefined || idCargo === undefined) {
      Alert.alert("Erro", "Todos os campos, incluindo a foto, são obrigatórios.");
      return;
    }

    // Converte data de nascimento para o formato YYYY-MM-DD
    const [day, month, year] = dataNascimento.split('/');
    const formattedDataNascimento = `${year}-${month}-${day}`;

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
        ? `http://ggustac-002-site1.htempurl.com/api/Candidato/${id}`
        : 'http://ggustac-002-site1.htempurl.com/api/Candidato';

      const method = id ? 'put' : 'post';

      const payload = {
        nomeCompleto,
        nomeUrna,
        dataNascimento: formattedDataNascimento,  // agora no formato correto
        uf,
        municipio,
        foto,  
        idStatus,
        idPartidoPolitico: idPartido,
        idCargoDisputado: idCargo,
        idUsuarioOperacao: Number(userId)
      };

      const response = await axios[method](endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      Alert.alert("Sucesso", `Candidato ${id ? "atualizado" : "cadastrado"} com sucesso.`);
      router.push('/(tabs)/candidatoList' as never);
    } catch (error: any) {
      console.error("Erro ao cadastrar/atualizar candidato:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados do candidato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id ? 'Editar Candidato' : 'Cadastro de Candidato'}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {foto ? <Image source={{ uri: foto }} style={styles.image} /> : null}
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            value={nomeCompleto}
            onChangeText={setNomeCompleto}
          />
          <TextInput
            style={styles.input}
            placeholder="Nome de Urna"
            value={nomeUrna}
            onChangeText={setNomeUrna}
          />
          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/YYYY)"
            value={dataNascimento}
            onChangeText={handleDateChange}
            maxLength={10} // Limita o comprimento para DD/MM/YYYY
          />
          <TextInput
            style={styles.input}
            placeholder="URL da Foto"
            value={foto}
            onChangeText={setFoto}
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
            {municipios.map((cidade) => (
              <Picker.Item key={cidade} label={cidade} value={cidade} />
            ))}
          </Picker>

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

          <Text>Partido Político:</Text>
          <Picker
            selectedValue={idPartido}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdPartido(Number(itemValue))}
          >
            <Picker.Item label="Selecione o Partido" value={undefined} />
            {partidoOptions.map((partido) => (
              <Picker.Item key={partido.id} label={`${partido.nome} (${partido.sigla})`} value={partido.id} />
            ))}
          </Picker>

          <Text>Cargo Disputado:</Text>
          <Picker
            selectedValue={idCargo}
            style={styles.picker}
            onValueChange={(itemValue: number) => setIdCargo(Number(itemValue))}
          >
            <Picker.Item label="Selecione o Cargo" value={undefined} />
            {cargoOptions.map((cargo) => (
              <Picker.Item key={cargo.id} label={cargo.nome} value={cargo.id} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.registerButton} onPress={handleCadastro}>
            <Text style={styles.registerButtonText}>{id ? "Salvar Alterações" : "Cadastrar Candidato"}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 15,
    alignSelf: 'center',
  },
  registerButton: {
    backgroundColor: '#1a2b52', // Cor do botão padrão
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff', // Texto em branco
    fontSize: 16,
    fontWeight: 'bold',
  },
});
