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

export const documents = (): Promise<DocumentResult[]> =>
  database.ref('documents').once('value')
    .then((snap: firebase.database.DataSnapshot) => {
      if (snap.exists()) {
        const value = snap.val();
        return Object.keys(value).map(key => prepareEntryForTransport(value[key]));
      }
      return [];
    });

export const documentByID = (id: string): Promise<DocumentResult> =>
  database.ref(`documents/${id}`).once('value')
    .then((snap: firebase.database.DataSnapshot) => {
      if (snap.exists()) {
        return prepareEntryForTransport(snap.val());
      }
      throw new Error('Not found');
    });

export const addDocument = (id: string, body: string, rev?: string): Promise<DocumentResult> => {
  const ref = database.ref(`documents/${id}`);
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
