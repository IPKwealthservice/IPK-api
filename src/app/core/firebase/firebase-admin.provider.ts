import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
//import { join } from 'path';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

const resolveFirebaseCredential = (): admin.credential.Credential => {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_SERVICE_ACCOUNT_PATH,
  } = process.env;

  // Try environment variables first
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    return admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey,
    });
  }

  // Try fallback paths
  const fallbackPaths = [FIREBASE_SERVICE_ACCOUNT_PATH, 'firebase-service-account.json'].filter(
    (p): p is string => !!p,
  );

  for (const candidate of fallbackPaths) {
    if (!existsSync(candidate)) continue;
    try {
      const raw = readFileSync(candidate, 'utf8');
      const parsed = JSON.parse(raw) as admin.ServiceAccount;
      return admin.credential.cert(parsed);
    } catch (err) {
      console.error(`Failed to load Firebase credentials from ${candidate}:`, err);
      continue;
    }
  }

  throw new Error(
    'Firebase credentials are not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY env vars or provide firebase-service-account.json file.',
  );
};

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  useFactory: () => {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: resolveFirebaseCredential(),
      });
    }
    return admin;
  },
};

// Backward/forward compatible export with the expected lower-case name
export const firebaseAdminProvider = FirebaseAdminProvider;
