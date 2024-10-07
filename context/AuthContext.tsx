import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  isLoggedIn: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isLoggedIn = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      setToken(userToken);
    } catch (error) {
      console.log("Error fetching token from AsyncStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []); // Ensure this runs only once on mount

  return (
    <AuthContext.Provider value={{ token, isLoading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};