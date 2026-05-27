import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

/**
 * Fetches an authenticated file (with JWT) and returns a blob URL usable in
 * <img src> / <a href> / <iframe src>. Cleans up the blob URL on unmount.
 *
 * Needed because plain <img src="/api/..."> doesn't send the Authorization
 * header, so JWT-protected file endpoints reject the request.
 */
export function useAuthedFile(path) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let created = null;
    setLoading(true);
    setError(null);

    api
      .get(path, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        created = URL.createObjectURL(res.data);
        setUrl(created);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [path]);

  return { url, loading, error };
}
