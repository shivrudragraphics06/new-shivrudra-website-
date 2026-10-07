import { useEffect, useState } from "react";
import { PUBLIC_CONTENT_CHANGE_KEY } from "@/lib/api";

export function usePublicContent<T>(fetchContent: () => Promise<T>, fallback: T) {
  const [content, setContent] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let request = 0;
    let pending = false;
    let refreshAgain = false;
    async function refresh() {
      if (pending) {
        refreshAgain = true;
        return;
      }
      pending = true;
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
        pending = false;
        if (!cancelled && current === request) setLoading(false);
        if (!cancelled && refreshAgain) {
          refreshAgain = false;
          void refresh();
        }
      }
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === PUBLIC_CONTENT_CHANGE_KEY) onVisible();
    };
    void refresh();
    const timer = window.setInterval(onVisible, 30000);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onVisible);
    window.addEventListener("storage", onStorage);
    window.addEventListener(PUBLIC_CONTENT_CHANGE_KEY, onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onVisible);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PUBLIC_CONTENT_CHANGE_KEY, onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchContent]);

  return { content, loading, error };
}
