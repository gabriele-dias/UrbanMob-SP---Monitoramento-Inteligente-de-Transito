import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 8000,
  headers: { Accept: "application/json" },
});

export async function getTraffic() {
  const { data } = await api.get("/traffic");
  return data;
}

export async function getRegions() {
  const { data } = await api.get("/regioes");
  return data;
}

export async function getRegionTraffic(name) {
  const { data } = await api.get(`/traffic/${encodeURIComponent(name)}`);
  return data;
}

export async function searchAddress(address) {
  const { data } = await api.get("/buscar", { params: { endereco: address } });
  return data;
}

export async function getMapConfig() {
  const { data } = await api.get("/mapa");
  return data;
}
