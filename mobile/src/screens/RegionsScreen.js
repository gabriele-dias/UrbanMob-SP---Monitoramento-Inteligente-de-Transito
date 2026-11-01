import { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";

import RegionCard from "../components/RegionCard";
import { ErrorState, LoadingState } from "../components/RequestState";
import useApiData from "../hooks/useApiData";
import { RootStack } from "../navigation/navigators";
import { getRegions } from "../services/api";
import { commonStyles } from "../styles/common";

export default function RegionsScreen({ navigation }) {
  const loadRegions = useCallback(() => getRegions(), []);
  const { data, loading, error, refresh } = useApiData(loadRegions);

  if (loading && !data) return <View style={commonStyles.screen}><LoadingState /></View>;
  if (error && !data) return <View style={commonStyles.screen}><ErrorState message={error} onRetry={refresh} /></View>;

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <Text variant="titleLarge" style={commonStyles.title}>
        Regiões monitoradas
      </Text>
      {error ? <ErrorState message={error} onRetry={refresh} /> : null}
      {(data || []).map((region) => (
        <RegionCard
          key={region.nome}
          region={region}
          onPress={() =>
            navigation.navigate(RootStack.RegionDashboard, { regiao: region })
          }
        />
      ))}
    </ScrollView>
  );
}
