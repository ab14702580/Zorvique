import { useEffect, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import { getPendingPageDataRequests, subscribeToPageData } from '../../api/axios';
import PageLoadingContext from '../PageLoadingContext';
import PageLoadingOverlay from '../PageLoadingOverlay/PageLoadingOverlay';

const PAGE_DATA_QUIET_WINDOW = 250;

export default function PageLoadingBoundary() {
  const location = useLocation();
  const navigation = useNavigation();
  const pendingRequests = useSyncExternalStore(
    subscribeToPageData,
    getPendingPageDataRequests,
    getPendingPageDataRequests,
  );
  const [readyLocationKey, setReadyLocationKey] = useState(null);

  useEffect(() => {
    if (navigation.state !== 'idle' || pendingRequests > 0) return undefined;

    const timer = window.setTimeout(() => {
      setReadyLocationKey(location.key);
    }, PAGE_DATA_QUIET_WINDOW);

    return () => window.clearTimeout(timer);
  }, [location.key, navigation.state, pendingRequests]);

  const isLoading = navigation.state !== 'idle' || readyLocationKey !== location.key;
  const isDashboardRoute = /^\/(admin|seller|dashboard)(\/|$)/.test(location.pathname);

  return (
    <PageLoadingContext.Provider value={isLoading}>
      <Outlet />
      {isLoading && !isDashboardRoute && <PageLoadingOverlay />}
    </PageLoadingContext.Provider>
  );
}
