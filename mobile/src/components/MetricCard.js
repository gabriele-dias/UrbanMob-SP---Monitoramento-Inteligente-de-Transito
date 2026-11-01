import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

import { colors } from "../styles/theme";

export default function MetricCard({ label, value, detail }) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="labelLarge" style={styles.label}>
          {label}
        </Text>
        <Text variant="headlineSmall" style={styles.value}>
          {value}
        </Text>
        {detail ? (
          <Text variant="bodySmall" style={styles.detail}>
            {detail}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, marginBottom: 12, flex: 1 },
  label: { color: colors.muted },
  value: { color: colors.text, fontWeight: "700", marginTop: 6 },
  detail: { color: colors.muted, marginTop: 4 },
});
