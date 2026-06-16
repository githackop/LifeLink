import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { getErrorMessage } from '../services/api';
import { clearToken, getToken, setRememberMe, setToken } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authService.getMe();
      setUser(data.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleRegister = useCallback(async (formData) => {
    try {
      const { data } = await authService.register(formData);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        toast.success('Welcome to LifeLink!');
      }
      return data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, []);

  const handleLogin = useCallback(async (credentials, remember = false) => {
    try {
      setRememberMe(remember);
      const { data } = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      return data.user;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const handleForgotPassword = useCallback(async (email) => {
    try {
      const { data } = await authService.forgotPassword(email);
      toast.success(data.message);
      return data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, []);

  const handleResetPassword = useCallback(async (resetToken, password) => {
    try {
      const { data } = await authService.resetPassword(resetToken, password);
      setToken(data.token);
      setUser(data.user);
      toast.success('Password updated successfully!');
      return data.user;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, []);

  const handleVerifyEmailOtp = useCallback(async (email, otp) => {
    try {
      const { data } = await authService.verifyEmailOtp(email, otp);
      setToken(data.token);
      setUser(data.user);
      toast.success('Email verified successfully! Welcome.');
      return data.user;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      register: handleRegister,
      login: handleLogin,
      logout,
      forgotPassword: handleForgotPassword,
      resetPassword: handleResetPassword,
      verifyEmailOtp: handleVerifyEmailOtp,
      refreshUser: loadUser,
      updateUser,
    }),
    [user, loading, handleRegister, handleLogin, logout, handleForgotPassword, handleResetPassword, handleVerifyEmailOtp, loadUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
