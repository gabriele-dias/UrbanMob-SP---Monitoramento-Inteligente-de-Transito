import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

import { trafficColor } from "../styles/theme";

export default function RegionCard({ region, onPress }) {
  return (
    <Card mode="contained" onPress={onPress} style={styles.card}>
      <Card.Content style={styles.content}>
        <View>
          <Text variant="titleMedium">{region.nome}</Text>
          <Text variant="bodyMedium">
            {region.velocidade_media} km/h · {region.intensidade}
          </Text>
        </View>
        <View
          accessibilityLabel={`Trânsito ${region.intensidade}`}
          style={[
            styles.indicator,
            { backgroundColor: trafficColor(region.intensidade) },
          ]}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  content: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  indicator: { borderRadius: 8, height: 16, width: 16 },
});
