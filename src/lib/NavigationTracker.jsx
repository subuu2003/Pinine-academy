import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Suppress console log in production
    if (process.env.NODE_ENV === 'development') {
      // console.log('Navigated to:', location.pathname);
    }
  }, [location]);

  return null;
}