import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  useFactory: () => {
    console.log('⚠️  Firebase disabled for development');
    return admin;
  },
};

// Backward/forward compatible export with the expected lower-case name
export const firebaseAdminProvider = FirebaseAdminProvider;
