import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cross-platform network helper that avoids web-specific code
export class NetworkHelper {
  static async isOnline(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }
    
    // For native, we can check connectivity
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  static async getNetworkType(): Promise<'wifi' | 'cellular' | 'unknown' | 'none'> {
    if (Platform.OS === 'web') {
      // Web can't reliably detect network type
      return navigator.onLine ? 'unknown' : 'none';
    }
    
    try {
      const { getNetworkStateAsync } = await import('expo-network');
      const state = await getNetworkStateAsync();
      
      if (!state.isConnected) return 'none';
      if (state.type === 'WIFI') return 'wifi';
      if (state.type === 'CELLULAR') return 'cellular';
      return 'unknown';
    } catch (error) {
      console.error('[NetworkHelper] Error getting network type:', error);
      return 'unknown';
    }
  }
  
  static async getLocalIP(): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Web can't get local IP without WebRTC
      return null;
    }
    
    try {
      const { getIpAddressAsync } = await import('expo-network');
      return await getIpAddressAsync();
    } catch (error) {
      console.error('[NetworkHelper] Error getting IP:', error);
      return null;
    }
  }
}