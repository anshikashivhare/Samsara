import { useEffect, useState } from 'react';

export function useApi(loader, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: null });
    loader().then(data => active && setState({ loading: false, data, error: null }))
      .catch(error => active && setState({ loading: false, data: null, error }));
    return () => { active = false; };
  }, deps);
  return state;
}
