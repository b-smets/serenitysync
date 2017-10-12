import * as firebase from 'firebase-admin';
import { DocumentRevision } from '../../document/document';
import { Store } from '../store';
import { documentRef, documentsRootRef } from './firebaseProvider';

export class FirebaseStore implements Store {

  allDocuments(databaseName: string): Promise<DocumentRevision[]> {
    return documentsRootRef(databaseName).once('value')
      .then((snap: firebase.database.DataSnapshot) => {
        if (snap.exists()) {
          const value = snap.val();
          return Object.keys(value).map(key => value[key]);
        }
        return [];
      });
  }

  document(databaseName: string, id: string): Promise<DocumentRevision | undefined> {
    return documentRef(databaseName, id).once('value')
      .then((snap: firebase.database.DataSnapshot) => {
        if (snap.exists()) {
          return snap.val();
        }
        return undefined;
      });
  }

  setDocument(databaseName: string, document: DocumentRevision): Promise<void> {
    return documentRef(databaseName, document.id).set(document);
  }
}
