import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { jwtDecode } from 'jwt-decode';

const STORAGE_KEY = 'expense-chat-auth';

// Demo users for testing
const DEMO_USERS = [
  {
    id: '1',
    email: 'demo@expensechat.com',
    name: 'Demo User',
    avatar: '',
    createdAt: new Date().toISOString()
  }
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const { user } = JSON.parse(savedAuth);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (err) {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check demo account
      if (email === 'demo@expensechat.com' && password === 'demo123') {
        const user = DEMO_USERS[0];
        const authData = { user, timestamp: Date.now() };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        return;
      }

      // Check if user exists in localStorage (for registered users)
      const registeredUsers = JSON.parse(localStorage.getItem('expense-chat-users') || '[]');
      const user = registeredUsers.find((u: any) => u.email === email);

      if (!user) {
        throw new Error('User not found. Please check your email or create an account.');
      }

      if (user.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }

      const { password: _, ...userWithoutPassword } = user;
      const authData = { user: userWithoutPassword, timestamp: Date.now() };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const registeredUsers = JSON.parse(localStorage.getItem('expense-chat-users') || '[]');
      const existingUser = registeredUsers.find((u: any) => u.email === email);

      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In a real app, this would be hashed
        name,
        avatar: '',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      registeredUsers.push(newUser);
      localStorage.setItem('expense-chat-users', JSON.stringify(registeredUsers));

      // Auto-login the new user
      const { password: _, ...userWithoutPassword } = newUser;
      const authData = { user: userWithoutPassword, timestamp: Date.now() };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    setError(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      const authData = { user: updatedUser, timestamp: Date.now() };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      // Update in registered users list if not demo user
      if (updatedUser.email !== 'demo@expensechat.com') {
        const registeredUsers = JSON.parse(localStorage.getItem('expense-chat-users') || '[]');
        const userIndex = registeredUsers.findIndex((u: any) => u.id === updatedUser.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...updates };
          localStorage.setItem('expense-chat-users', JSON.stringify(registeredUsers));
        }
      }
    }
  };

  const clearError = () => setError(null);

  const googleLogin = async (credentialResponse: any) => {
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // credentialResponse.credential is a JWT
      const decoded: any = jwtDecode(credentialResponse.credential);
      // decoded contains: email, name, picture, sub (Google user id)
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        createdAt: new Date().toISOString(),
      };
      const authData = { user, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (err) {
      setError('Google login failed');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  return {
    ...authState,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    googleLogin
  };
};