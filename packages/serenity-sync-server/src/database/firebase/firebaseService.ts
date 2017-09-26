import * as firebase from 'firebase-admin';
import { calculateRevisionID } from '../../util/revisions';
import { DocumentResult } from '../../schema';

const serviceAccount = require('../../../config/firebase.json');

const app = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://sync-1b17c.firebaseio.com',
});

const database = app.database();

interface Document {
  id: string;
  rev: string;
  body: any;
}

const prepareEntryForTransport = (entry: Document) => ({ ...entry, body: JSON.stringify(entry.body) });
const documentRef = (databaseName: string, id: string) => database.ref(`data/${databaseName}/documents/${id}`);

export const documents = (databaseName: string): Promise<DocumentResult[]> =>
  database.ref(`data/${databaseName}/documents`).once('value')
    .then((snap: firebase.database.DataSnapshot) => {
      if (snap.exists()) {
        const value = snap.val();
        return Object.keys(value).map(key => prepareEntryForTransport(value[key]));
      }
      return [];
    });

export const documentByID = (databaseName: string, id: string): Promise<DocumentResult> =>
  documentRef(databaseName, id).once('value')
    .then((snap: firebase.database.DataSnapshot) => {
      if (snap.exists()) {
        return prepareEntryForTransport(snap.val());
      }
      throw new Error('Not found');
    });

export const addDocument = (databaseName: string, id: string, body: string, rev?: string): Promise<DocumentResult> => {
  const ref = documentRef(databaseName, id);
  return ref.once('value')
    .then((snap: firebase.database.DataSnapshot) => {
      if (snap.exists()) {
        const current = snap.val();
        if (current.rev !== rev) {
          throw new Error('Revision conflict: ' + current.rev);
        }
      }
      const newRevSequenceNumber = calculateRevisionID(body, rev);
      const entry = {
        id,
        rev: newRevSequenceNumber,
        body: JSON.parse(body),
      };
      return ref.set(entry).then(() => ({ ...entry, body }));
    });
};

export const deleteDocument = (databaseName: string, id: string, rev: string): Promise<DocumentResult> => {
  const ref = documentRef(databaseName, id);
  return ref.once('value')
    .then((snap: firebase.database.DataSnapshot) => {
      if (!snap.exists()) {
        throw new Error('Not found');
      }
      const current = snap.val();
      if (current.rev !== rev) {
        throw new Error('Revision conflict: ' + current.rev);
      }
      const newRevSequenceNumber = calculateRevisionID('', rev);
      const entry = {
        id,
        rev: newRevSequenceNumber,
        deleted: true,
      };
      return ref.set(entry).then(() => entry);
    });
};
