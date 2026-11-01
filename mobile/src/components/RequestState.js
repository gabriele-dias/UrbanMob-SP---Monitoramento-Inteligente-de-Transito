import { Button, Text } from "react-native-paper";

export function LoadingState({ label = "Carregando..." }) {
  return <Text accessibilityRole="alert">{label}</Text>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <>
      <Text accessibilityRole="alert">{message}</Text>
      {onRetry ? (
        <Button mode="text" onPress={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </>
  );
}
