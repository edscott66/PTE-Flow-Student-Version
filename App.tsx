/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import * as ExpoRouter from 'expo-router';

// Must be exported or used with registerRootComponent
export default function App() {
  // @ts-ignore
  const ExpoRoot = ExpoRouter.ExpoRoot || (ExpoRouter.default && (ExpoRouter.default as any).ExpoRoot);

  // require.context is a Metro-specific feature for Expo Router.
  // In a browser/Vite environment, it is not defined, which causes a "require is not defined" ReferenceError.
  // We check for its existence safely using globalThis to avoid direct reference.
  const _global = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {} as any);
  const _require = _global['require'];
  
  let ctx = null;
  if (typeof _require === 'function' && typeof _require.context === 'function') {
    try {
      ctx = _require.context('./app');
    } catch (e) {
      console.warn('Failed to initialize require.context:', e);
    }
  } else {
    console.log('require.context not detected. This is expected in a Vite/web environment.');
  }

  if (ctx === null && Platform.OS !== 'web') {
    // If we're on native and ctx is missing, something is wrong.
    // On web, it's often null or handled differently.
    console.warn('require.context is null. Expo Router might not function correctly on native.');
  }

  if (!ExpoRoot) {
    console.warn('ExpoRoot could not be found in expo-router exports.');
    return null;
  }

  return <ExpoRoot context={ctx} />;
}
