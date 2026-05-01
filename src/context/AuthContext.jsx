import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProviderComponent({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function restoreSession() {
      const savedToken = localStorage.getItem('taskflow_token');
      if (savedToken) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('taskflow_token');
          setToken(null);
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('taskflow_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  }

  async function signup(name, email, password, role) {
    try {
      await api.post('/api/auth/signup', { name, email, password, role });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
      };
    }
  }

  function logout() {
    localStorage.removeItem('taskflow_token');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = AuthProviderComponent;
