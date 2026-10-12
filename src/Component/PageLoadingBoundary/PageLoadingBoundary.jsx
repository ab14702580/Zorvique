import { useEffect, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getPendingPageDataRequests, subscribeToPageData } from '../../api/axios';

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

  return (
    <>
      <Outlet />
      {isLoading && (
        <div
          className="fixed inset-0 z-10000 flex flex-col items-center justify-center gap-4 bg-white"
          role="status"
          aria-live="polite"
        >
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg">
              <ShoppingBag size={26} strokeWidth={1.8} />
            </div>
            <div className="absolute -inset-2 animate-spin rounded-[22px] border-[3px] border-rose-200 border-t-rose-600" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-slate-800">Multiventor</p>
            <p className="mt-1 text-xs text-slate-500">Loading page...</p>
          </div>
        </div>
      )}
    </>
  );
}
