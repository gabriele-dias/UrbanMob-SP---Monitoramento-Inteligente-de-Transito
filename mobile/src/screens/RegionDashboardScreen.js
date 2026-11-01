import { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";

import MetricCard from "../components/MetricCard";
import { ErrorState, LoadingState } from "../components/RequestState";
import useApiData from "../hooks/useApiData";
import { getRegionTraffic } from "../services/api";
import { commonStyles } from "../styles/common";

export default function RegionDashboardScreen({ route }) {
  const { regiao } = route.params;
  const loadRegion = useCallback(
    () => getRegionTraffic(regiao.nome),
    [regiao.nome],
  );
  const { data, loading, error, refresh } = useApiData(loadRegion);

  if (loading && !data) return <View style={commonStyles.screen}><LoadingState /></View>;
  if (error && !data) return <View style={commonStyles.screen}><ErrorState message={error} onRetry={refresh} /></View>;

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <Text variant="titleLarge" style={commonStyles.title}>
        {data.regiao}
      </Text>
      {error ? <ErrorState message={error} onRetry={refresh} /> : null}
      <MetricCard label="Intensidade" value={data.intensidade} />
      <MetricCard
        label="Velocidade média"
        value={`${data.velocidade_media} km/h`}
      />
      <MetricCard
        label="Localização"
        value={`${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`}
      />
    </ScrollView>
  );
}
