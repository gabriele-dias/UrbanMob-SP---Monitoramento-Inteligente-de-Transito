import { createContext, useContext, useMemo, useState } from "react";

const MapContext = createContext(null);

export function MapContextProvider({ children }) {
  const [searchResult, setSearchResult] = useState(null);
  const value = useMemo(
    () => ({ searchResult, setSearchResult }),
    [searchResult],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext deve ser usado dentro de MapContextProvider");
  }
  return context;
}
