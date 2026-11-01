export const colors = {
  primary: "#176B52",
  background: "#F4F7F5",
  surface: "#FFFFFF",
  text: "#1D2B26",
  muted: "#63736C",
  light: "#2E9D50",
  moderate: "#E6A700",
  heavy: "#D93636",
};

export const theme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
  },
};

export function trafficColor(intensity) {
  if (intensity === "Alto") return colors.heavy;
  if (intensity === "Moderado") return colors.moderate;
  return colors.light;
}
