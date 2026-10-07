import { useEffect, useState } from "react";

export function usePublicContent<T>(fetchContent: () => Promise<T>, fallback: T) {
  const [content, setContent] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let request = 0;
    async function refresh() {
      const current = ++request;
      try {
        const result = await fetchContent();
        if (!cancelled && current === request) {
          setContent(result);
          setError(false);
        }
      } catch {
        if (!cancelled && current === request) setError(true);
      } finally {
        if (!cancelled && current === request) setLoading(false);
      }
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    void refresh();
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchContent]);

  return { content, loading, error };
}
