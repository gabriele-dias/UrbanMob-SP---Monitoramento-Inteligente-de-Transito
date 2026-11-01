import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";

import MainTabs from "./navigation/MainTabs";
import { RootStack } from "./navigation/navigators";
import RegionDashboardScreen from "./screens/RegionDashboardScreen";
import { MapContextProvider } from "./contexts/MapContext";
import { theme } from "./styles/theme";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <MapContextProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name={RootStack.Tabs}
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={RootStack.RegionDashboard}
              component={RegionDashboardScreen}
              options={({ route }) => ({ title: route.params.regiao.nome })}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="dark" />
      </MapContextProvider>
    </PaperProvider>
  );
}
