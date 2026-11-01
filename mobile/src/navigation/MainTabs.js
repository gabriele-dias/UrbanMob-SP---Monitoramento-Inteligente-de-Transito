import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import MapScreen from "../screens/MapScreen";
import RegionsScreen from "../screens/RegionsScreen";
import { MainTab } from "./navigators";
import { colors } from "../styles/theme";

const Tab = createBottomTabNavigator();
const icons = {
  [MainTab.Dashboard]: "view-dashboard-outline",
  [MainTab.Map]: "map-outline",
  [MainTab.Regions]: "map-marker-multiple-outline",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: "UrbanMob SP",
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={icons[route.name]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name={MainTab.Dashboard} component={DashboardScreen} />
      <Tab.Screen name={MainTab.Map} component={MapScreen} />
      <Tab.Screen name={MainTab.Regions} component={RegionsScreen} />
    </Tab.Navigator>
  );
}
