import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ProfileContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Carga el perfil del usuario autenticado UNA sola vez y lo comparte entre
 * todas las páginas (Sidebar, Dashboard, Perfil, Carrito, Curso...).
 * Evita que cada página vuelva a pedirlo y muestre, mientras tanto, un
 * sidebar con el rol equivocado o una pantalla sin sidebar.
 */
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    let res = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });

    if (res.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const refreshRes = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshRes.ok) return null;

      const data = await refreshRes.json();
      localStorage.setItem('access_token', data.access);
      res = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, Authorization: `Bearer ${data.access}` },
      });
    }

    return res;
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/users/profile/`);
      if (!res || !res.ok) {
        setProfile(null);
        if (res) setProfileError('No se pudo cargar tu perfil.');
        return null;
      }
      const data = await res.json();
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      setProfileError('No se pudo cargar tu perfil.');
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    // Se difiere a un microtask (en vez de llamarse directamente) para que la
    // carga inicial pase por el mismo callback que las actualizaciones por
    // 'auth-change', sin disparar setState de forma síncrona en el efecto.
    Promise.resolve().then(refreshProfile);
    window.addEventListener('auth-change', refreshProfile);
    return () => window.removeEventListener('auth-change', refreshProfile);
  }, [refreshProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, profileLoading, profileError, refreshProfile, setProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe usarse dentro de un ProfileProvider');
  }
  return context;
}
