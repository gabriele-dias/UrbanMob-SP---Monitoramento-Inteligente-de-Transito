import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

export default function AddressSearch({ onSearch, loading }) {
  const [address, setAddress] = useState("");

  function submit() {
    const value = address.trim();
    if (value) onSearch(value);
  }

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Pesquisar endereço"
        placeholder="Ex.: Avenida Paulista"
        value={address}
        onChangeText={setAddress}
        onSubmitEditing={submit}
        returnKeyType="search"
        style={styles.input}
      />
      <Button
        mode="contained"
        icon="magnify"
        onPress={submit}
        loading={loading}
        disabled={loading || !address.trim()}
      >
        Buscar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 12 },
  input: { backgroundColor: "white" },
});
