import { useEffect, useState } from 'react';

import { getMenuCollections, getMenuFeatured } from '../services/menuService';

// The menu is opened again and again during a visit, so the payload is kept for
// five minutes and every consumer shares the one in-flight request. The server
// caches the same way; this saves the round trip, not the aggregation.
const TTL = 5 * 60 * 1000;

let cache = { data: null, storedAt: 0 };
let inFlight = null;

const isFresh = () => cache.data !== null && Date.now() - cache.storedAt < TTL;

const load = () => {
  if (isFresh()) return Promise.resolve(cache.data);
  if (inFlight) return inFlight;

  inFlight = Promise.all([getMenuCollections(), getMenuFeatured()])
    .then(([collectionsResponse, featuredResponse]) => {
      const data = {
        collections: Array.isArray(collectionsResponse?.data) ? collectionsResponse.data : [],
        featured: featuredResponse?.data ?? null,
      };

      cache = { data, storedAt: Date.now() };

      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

// Drop the cache after an admin edits the featured card, so the next open shows
// the new copy without a reload.
export const clearMegaMenuCache = () => {
  cache = { data: null, storedAt: 0 };
};

const initialState = () =>
  isFresh()
    ? { ...cache.data, loading: false, error: null }
    : { collections: [], featured: null, loading: true, error: null };

export default function useMegaMenuData() {
  // A cached payload is used for the very first render, so the panel renders
  // complete instead of flashing skeletons on the second open. The state is only
  // written from the promise callbacks, never synchronously inside the effect.
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let active = true;

    if (isFresh()) return () => {
      active = false;
    };

    load()
      .then((data) => {
        if (active) setState({ ...data, loading: false, error: null });
      })
      .catch(() => {
        if (active) {
          setState({
            collections: [],
            featured: null,
            loading: false,
            error: 'We could not load the collections just now.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
