import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';

export default function LayoutTab() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FFFFFF', 
                tabBarInactiveTintColor: '#FFFFFF', 
                tabBarStyle: { backgroundColor: '#1a2b52' }, 
                headerStyle: { backgroundColor: '#0000FF' },
                headerTitleStyle: { color: '#FFFFFF' },
                headerTitleAlign: 'center',
                headerTitle: () => <Text style={{ fontSize: 20, color: '#FFFFFF' }}>Mapeia Voto</Text>,
            }}
        >
            <Tabs.Screen 
                name="principal" 
                options={{
                    title: "Principal",
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={25} color={color} />,
                }} 
            />
            <Tabs.Screen 
                name="usuarioList" 
                options={{
                    title: "Usuários",
                    tabBarIcon: ({ color }) => <Ionicons name="people" size={25} color={color} />,
                }} 
            />
            <Tabs.Screen 
                name="candidatoList" 
                options={{
                    title: "Candidatos",
                    tabBarIcon: ({ color }) => <Ionicons name="people" size={25} color={color} />,
                }} 
            />
            <Tabs.Screen 
                name="pesquisaEleitoralMunicipalList" 
                options={{
                    title: "Pesquisa",
                    tabBarIcon: ({ color }) => <Ionicons name="document-text" size={25} color={color} />,
                }}
            />
            <Tabs.Screen 
                name="dashboard" 
                options={{
                    title: "Estatisticas",
                    tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={25} color={color} />, // Ícone representativo do dashboard
                }} 
            />
        </Tabs>
    );
}
