import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 12,
  },
});
