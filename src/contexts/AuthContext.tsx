import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User, LoginRequest } from '../types';
import { authAPI } from '../services/api';
import { signalRService } from '../services/signalr';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app start
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Initialize SignalR connection
      signalRService.connect(storedToken).catch(console.error);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      
      if (response.code === 200) {
        const userData: User = {
          id: response.userId,
          userName: credentials.emailOrUser,
          email: credentials.emailOrUser.includes('@') ? credentials.emailOrUser : '',
          displayName: credentials.emailOrUser,
        };

        setUser(userData);
        setToken(response.token);
        
        // Store in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Initialize SignalR connection
        await signalRService.connect(response.token);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Disconnect SignalR
    await signalRService.disconnect();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};