import { useEffect } from 'react';
import api from '../api/axios';

// Generates / retrieves a persistent visitorId from localStorage.
// Tracks unique visitors per day — once per session on the same device.
function getOrCreateVisitorId() {
  const KEY = 'mvtr_vid';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function useVisitorTrack() {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    // Fire and forget — don't block rendering
    api.post('/visitors/track', { visitorId }).catch(() => {});
  }, []); // runs once per page mount
}
