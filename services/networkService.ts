import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { scoreService } from './scoreService';

export const networkService = {
  async getCurrentSSID(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        return Application.getAndroidId();
      }
      if (Platform.OS === 'ios') {
        return await Application.getIosIdForVendorAsync();
      }
      return 'web-client-id'; // Fallback for web
    } catch (error) {
      console.error("Error getting Hardware ID:", error);
      return null;
    }
  },

  async canEditTable(): Promise<boolean> {
    return true;
  }
};
