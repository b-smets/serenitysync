declare module 'firebase-mock' {
  import * as firebaseAdmin from 'firebase-admin';

  interface MockFirebase extends firebaseAdmin.database.Reference {
    new(path?: string, data?: any): MockFirebase;
    autoFlush: (delay: number) => MockFirebase;
  }
  export const MockFirebase: MockFirebase;
}
