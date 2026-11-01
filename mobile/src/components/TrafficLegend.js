import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { colors } from "../styles/theme";

const items = [
  { label: "Leve", color: colors.light },
  { label: "Moderado", color: colors.moderate },
  { label: "Intenso", color: colors.heavy },
];

export default function TrafficLegend() {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text variant="labelMedium">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-around", padding: 12 },
  item: { alignItems: "center", flexDirection: "row", gap: 6 },
  dot: { borderRadius: 6, height: 12, width: 12 },
});
