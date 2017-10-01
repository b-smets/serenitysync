declare module 'firebase-mock' {

  import * as firebaseAdmin from 'firebase-admin';

  interface MockFirebase extends firebaseAdmin.database.Database {
    new (path?: string, data?: any): MockFirebase;
    autoFlush: (autoFlush: boolean) => void;
    data: any;
  }
  export const MockFirebase: MockFirebase;

  type CreateDatabaseFn = () => MockFirebase;
  type CreateAuthFn = () => MockFirebase;

  interface MockFirebaseApp {
    database: () => MockFirebase,
    auth: () => MockFirebase,
  }

  export interface MockFirebaseSdk {
    new (createDatabase?: CreateDatabaseFn, createAuth?: CreateAuthFn) : MockFirebaseSdk;
    database: () => MockFirebase;
    auth: () => MockFirebase;
    initializeApp: () => MockFirebaseApp;
  }
  export const MockFirebaseSdk: MockFirebaseSdk;
}
