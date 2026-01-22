import * as SecureStore from 'expo-secure-store';
import { config } from './config';

// ============================================
// SECURE STORAGE HELPERS
// ============================================

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(config.TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(config.TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error saving token to storage:', error);
      throw error;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(config.TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing token from storage:', error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(config.TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

export default storage;
