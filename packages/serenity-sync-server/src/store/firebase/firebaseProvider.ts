import * as firebase from 'firebase-admin';

const serviceAccount = require('../../../config/firebase.json');

const app = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

export const documentsRootRef = (databaseName: string) =>
  app.database().ref(`data/${databaseName}/documents`);
export const documentRef = (databaseName: string, id: string) =>
  app.database().ref(`data/${databaseName}/documents/${id}`);
