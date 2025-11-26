
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromToken, Role } from '../utils/auth';
import { toast } from "react-toastify";
import { API_BASE_URL } from '@/lib/api';
export const useAuth = (allowedRoles: Role[] = []) => {
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromToken();
    console.log('useAuth - user:', user);

    if (!user) {
      router.replace('/login');
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [router]);
};


export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // blacklist token
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

   

    // Success message BEFORE redirect
    toast.success("Logged out successfully!", { autoClose: 800 });

  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Unable to logout. Please try again.");
  } finally {
    // Clear frontend token
    localStorage.removeItem("token");

    // Redirect after message shows
    setTimeout(() => {
      window.location.href = "/login";
    }, 900);
  }
};

