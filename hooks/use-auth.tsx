import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/auth';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('Error at useAuth hook.');
  }
  
  return context;
};