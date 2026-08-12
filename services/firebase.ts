import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  initializeAuth
} from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from './firebase-applet-config.json';
import { Platform } from 'react-native';

// 🔐 Prevent auto-login after logout
let preventAutoLogin = false;

export const disableAutoLogin = () => {
  preventAutoLogin = true;
};

export const enableAutoLogin = () => {
  preventAutoLogin = false;
};

export const isAutoLoginPrevented = () => preventAutoLogin;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const isWeb = Platform.OS === 'web';

// Initialize Auth with platform-specific persistence
let authInstance;

if (isWeb) {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (e) {
    console.warn("Native persistence initialization failed, falling back to default.", e);
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure anonymous auth for security rules if needed
export const ensureAuth = async () => {
  // If already signed in, return immediately
  if (auth.currentUser) return auth.currentUser;
  
  // If auto-login is prevented (e.g. during logout/welcome), respect that if desired
  // However, for core functionality like checking activations, we usually NEED auth
  
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else if (!preventAutoLogin) {
        try {
          const result = await signInAnonymously(auth);
          resolve(result.user);
        } catch (error) {
          console.error("Firebase Anonymous Auth failed:", error);
          reject(error);
        }
      } else {
        // If auto login is prevented and no user, we might be in a state where we can't act
        resolve(null);
      }
    });

    // Timeout after 5 seconds to prevent hanging
    setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser);
    }, 5000);
  });
};

