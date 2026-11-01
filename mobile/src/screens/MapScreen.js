import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Text } from "react-native-paper";

import AddressSearch from "../components/AddressSearch";
import TrafficLegend from "../components/TrafficLegend";
import { ErrorState, LoadingState } from "../components/RequestState";
import useApiData from "../hooks/useApiData";
import { useMapContext } from "../contexts/MapContext";
import { getRegions, searchAddress } from "../services/api";
import { trafficColor } from "../styles/theme";

const INITIAL_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.16,
  longitudeDelta: 0.16,
};

function errorMessage(error) {
  return error.response?.data?.erro || error.message || "Falha na busca.";
}

export default function MapScreen() {
  const mapRef = useRef(null);
  const loadRegions = useCallback(() => getRegions(), []);
  const { data: regions, loading, error, refresh } = useApiData(loadRegions);
  const { searchResult, setSearchResult } = useMapContext();
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const onSearch = useCallback(async (address) => {
    setSearching(true);
    setSearchError(null);
    try {
      const result = await searchAddress(address);
      setSearchResult(result);
      mapRef.current?.animateToRegion(
        {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        700,
      );
    } catch (requestError) {
      setSearchError(errorMessage(requestError));
    } finally {
      setSearching(false);
    }
  }, [setSearchResult]);

  return (
    <View style={styles.screen}>
      <AddressSearch onSearch={onSearch} loading={searching} />
      {searchError ? <Text style={styles.error}>{searchError}</Text> : null}
      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : loading && !regions ? (
        <LoadingState label="Carregando regiões..." />
      ) : null}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsCompass
      >
        {(regions || []).map((region) => (
          <Marker
            key={region.nome}
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            pinColor={trafficColor(region.intensidade)}
            title={region.nome}
            description={`Trânsito ${region.intensidade} · ${region.velocidade_media} km/h`}
          />
        ))}
        {searchResult ? (
          <Marker
            coordinate={{
              latitude: searchResult.latitude,
              longitude: searchResult.longitude,
            }}
            title={searchResult.nome}
            pinColor="#176B52"
          />
        ) : null}
      </MapView>
      <TrafficLegend />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  map: { flex: 1 },
  error: { color: "#B42318", paddingHorizontal: 12, paddingBottom: 8 },
});
