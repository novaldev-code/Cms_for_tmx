import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

export function useApiResource(path) {
  const [state, setState] = useState({
    status: path ? 'loading' : 'idle',
    data: null,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ status: 'idle', data: null, error: null });
      return undefined;
    }

    let active = true;

    setState({
      status: 'loading',
      data: null,
      error: null,
    });

    apiRequest(path)
      .then((data) => {
        if (active) {
          setState({ status: 'success', data, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ status: 'error', data: null, error });
        }
      });

    return () => {
      active = false;
    };
  }, [path, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, reload };
}
