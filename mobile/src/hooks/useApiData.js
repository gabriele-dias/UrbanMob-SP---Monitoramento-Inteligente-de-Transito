import { useCallback, useEffect, useState } from "react";

export default function useApiData(loadData) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadData());
    } catch (requestError) {
      setError(
        requestError.response?.data?.erro ||
          requestError.message ||
          "Não foi possível carregar os dados.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
