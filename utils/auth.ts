// utils/auth.ts
import { jwtDecode } from 'jwt-decode';

export type Role = 'user' | 'creator' | 'admin';

export interface JwtPayload {
  id: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Returns only decoded user payload
 */
export const getUserFromToken = (): JwtPayload | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

/**
 * NEW: Full auth object (token + userId + role)
 * Perfect for socket.io and API headers
 */
export const getAuthUser = () => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return {
      token,
      userId: decoded.id,
      role: decoded.role
    };
  } catch {
    return null;
  }
};
