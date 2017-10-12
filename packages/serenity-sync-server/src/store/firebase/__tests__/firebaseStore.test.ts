jest.unmock('../firebaseStore');
jest.unmock('firebase-mock');
jest.mock('../firebaseProvider', () => ({
  documentsRootRef: jest.fn(),
  documentRef: jest.fn(),
}));

import { MockFirebase } from 'firebase-mock';
import { documentRef, documentsRootRef } from '../firebaseProvider';
import { FirebaseStore } from '../firebaseStore';

describe('FirebaseStore', () => {

  const store = new FirebaseStore();
  let database: MockFirebase;

  const initializeDatabase = (data: any) => {
    database = new MockFirebase('https://firebaseio.com', data).autoFlush(0);
  };

  beforeAll(() => {
    (documentsRootRef as jest.Mock<any>).mockImplementation(() => database);
    (documentRef as jest.Mock<any>).mockImplementation(() => database);
  });

  beforeEach(() => {
    initializeDatabase({});
  });

  describe('allDocuments', () => {

    test('uses the correct database document root ref', () => {
      return store.allDocuments('mydb').then(result => {
        expect(documentsRootRef).toBeCalledWith('mydb');
      });
    });

    test('returns a list of documents', () => {
      initializeDatabase({
        foo: {
          id: 'foo',
          rev: '1-abc',
          body: {
            one: 'alpha',
            two: 'beta',
            three: 'gamma',
          },
        },
        bar: {
          id: 'bar',
          rev: '2-def',
          body: {
            three: 'delta',
            four: 'epsilon',
            five: 'omega',
          },
        },
      });
      return store.allDocuments('mydb').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('returns an empty list if the database contains no documents', () => {
      return store.allDocuments('mydb').then(result => {
        expect(result).toEqual([]);
      });
    });

    test('returns an empty list if the database does not exist', () => {
      initializeDatabase(undefined);
      return store.allDocuments('mydb').then(result => {
        expect(result).toEqual([]);
      });
    });
  });

  describe('document', () => {

    test('uses the correct document ref', () => {
      return store.document('mydb', 'foo').then(result => {
        expect(documentRef).toBeCalledWith('mydb', 'foo');
      });
    });

    test('returns the document if it exists', () => {
      const document = {
        id: 'foo',
        rev: '1-abc',
        body: {
          one: 'alpha',
          two: 'beta',
          three: 'gamma',
        },
      };

      initializeDatabase(document);
      return store.document('mydb', 'foo').then(result => {
        expect(result).toEqual(document);
      });
    });

    test('returns undefined if the document does not exist', () => {
      return store.document('mydb', 'foo').then(result => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('setDocument', () => {

    const document = {
      id: 'foo',
      rev: '1-abc',
      body: {
        one: 'alpha',
        two: 'beta',
        three: 'gamma',
      },
    };

    test('uses the correct document ref', () => {
      return store.setDocument('mydb', document).then(result => {
        expect(documentRef).toBeCalledWith('mydb', 'foo');
      });
    });

    test('sets the document if it did not yet exist', () => {
      const spy = jest.spyOn(database, 'set');
      return store.setDocument('mydb', document).then(result => {
        expect(spy).toBeCalledWith(document);
      });
    });
  });
});
