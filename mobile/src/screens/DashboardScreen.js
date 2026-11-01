import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import MetricCard from "../components/MetricCard";
import { ErrorState, LoadingState } from "../components/RequestState";
import useApiData from "../hooks/useApiData";
import { getTraffic } from "../services/api";
import { commonStyles } from "../styles/common";
import { colors } from "../styles/theme";

function formatUpdatedAt(value) {
  if (!value) return "Indisponível";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Indisponível"
    : date.toLocaleString("pt-BR");
}

export default function DashboardScreen() {
  const loadDashboard = useCallback(() => getTraffic(), []);
  const { data, loading, error, refresh } = useApiData(loadDashboard);

  if (loading && !data) return <View style={commonStyles.screen}><LoadingState /></View>;
  if (error && !data) return <View style={commonStyles.screen}><ErrorState message={error} onRetry={refresh} /></View>;

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <Text variant="titleLarge" style={commonStyles.title}>
        Trânsito em São Paulo
      </Text>
      {error ? <ErrorState message={error} onRetry={refresh} /> : null}
      <View style={styles.row}>
        <MetricCard
          label="Congestionamento"
          value={data.congestionamento}
          detail="Nível geral"
        />
        <MetricCard
          label="Velocidade média"
          value={`${data.velocidade_media} km/h`}
          detail="Média da cidade"
        />
      </View>
      <MetricCard
        label="Região mais crítica"
        value={data.regiao_critica}
        detail={`${data.regioes_monitoradas} regiões monitoradas`}
      />
      <MetricCard
        label="Última atualização"
        value={formatUpdatedAt(data.ultima_atualizacao)}
      />
      <Button
        mode="outlined"
        icon="refresh"
        loading={loading}
        disabled={loading}
        onPress={refresh}
        textColor={colors.primary}
      >
        Atualizar dados
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
});
