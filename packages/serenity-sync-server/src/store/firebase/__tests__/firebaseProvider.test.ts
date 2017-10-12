jest.unmock('../firebaseProvider');
jest.mock(
  '../../../../config/firebase.json',
  () => ({
    project_id: 'test',
  }),
  { virtual: true }
);

const mockDb = {
  ref: jest.fn(),
};
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn().mockReturnValue({
    database: jest.fn().mockImplementation(() => mockDb),
  }),
  credential: {
    cert: jest.fn().mockReturnValue('foo'),
  },
}));

import * as firebase from 'firebase-admin';
import { documentRef, documentsRootRef } from '../firebaseProvider';

describe('firebaseProvider', () => {

  beforeEach(() => {
    mockDb.ref.mockReset();
  });

  test('initializes the database', () => {
    expect(firebase.initializeApp).toBeCalledWith({
      credential: 'foo',
      databaseURL: 'https://test.firebaseio.com',
    });
  });

  test('retrieves the root documents reference', () => {
    const expected = {};
    mockDb.ref.mockReturnValue(expected);
    expect(documentsRootRef('mydb')).toBe(expected);
  });

  test('uses the correct database for obtaining the reference to the root of the documents', () => {
    documentsRootRef('mydb');
    expect(mockDb.ref).toBeCalledWith('data/mydb/documents');
  });

  test('retrieves the reference to a document', () => {
    const expected = {};
    mockDb.ref.mockReturnValue(expected);
    expect(documentRef('mydb', 'foo')).toBe(expected);
  });

  test('uses the correct database for obtaining the reference to a document', () => {
    documentRef('mydb', 'foo');
    expect(mockDb.ref).toBeCalledWith('data/mydb/documents/foo');
  });
});
