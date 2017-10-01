jest.unmock('../firebaseService');

import * as firebase from 'firebase-admin';
import { MockFirebase } from 'firebase-mock';
import { addDocument, deleteDocument, documents, documentByID } from '../firebaseService';

const getDatabase = () => (firebase.database().ref() as any) as MockFirebase;
const setInitialData = (data: any) => (firebase as any).__setMockData(data);

describe('Firebase Service', () => {

  beforeEach(() => {
    (firebase as any).__clear();
  });

  describe('documents', () => {

    test('obtains a list of documents from the firebase', () => {
      setInitialData({
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
      return documents('myDB').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('obtains an empty list if the database is empty', () => {
      setInitialData({});
      return documents('myDB').then(result => {
        expect(result).toEqual([]);
      });
    });

    test('obtains an empty list if the database is unknown', () => {
      return documents('myDB').then(result => {
        expect(result).toEqual([]);
      });
    });

    test('rejects if retrieving the data fails', () => {
      const expectedError = new Error('fail');
      getDatabase().failNext('once', expectedError);
      return documents('myDB')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });
  });

  describe('documentByID', () => {

    test('retrieves the document with given id', () => {
      setInitialData({
        id: 'foo',
        rev: '1-abc',
        body: {
          one: 'alpha',
          two: 'beta',
          three: 'gamma',
        },
      });
      return documentByID('myDB', 'foo').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('rejects if the given document could not be found', () => {
      return documentByID('myDB', 'foo')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error.message).toMatch('Not found'));
    });

  });

  describe('addDocument', () => {

    const existing = {
      id: 'foo',
      rev: '1-abc',
      body: {
        three: 'delta',
        four: 'epsilon',
        five: 'omega',
      },
    };

    const body = JSON.stringify({
      one: 'alpha',
      two: 'beta',
      three: 'gamma',
    });

    test('adds a new document to the database', () => {
      return addDocument('myDB', 'foo', body).then(result => {
        expect(getDatabase().getData()).toMatchSnapshot();
      }); 
    });

    test('returns the added document', () => {
      return addDocument('myDB', 'foo', body).then(result => {
        expect(result).toMatchSnapshot();
      }); 
    });

    test('updates an existing document in the database', () => {
      setInitialData(existing);
      return addDocument('myDB', 'foo', body, '1-abc').then(result => {
        expect(getDatabase().getData()).toMatchSnapshot();
      }); 
    });

    test('returns the updated document', () => {
      setInitialData(existing);
      return addDocument('myDB', 'foo', body, '1-abc').then(result => {
        expect(result).toMatchSnapshot();
      }); 
    });

    test('rejects updates in case of revision conflicts', () => {
      setInitialData(existing);
      return addDocument('myDB', 'foo', body, '1-def').then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('Revision conflict: 1-abc');
      });
    });

    test('rejects updates if the rev parameter is omitted', () => {
      setInitialData(existing);
      return addDocument('myDB', 'foo', body).then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('Revision conflict: 1-abc');
      });
    });

    test('rejects if retrieving the current revision fails', () => {
      setInitialData(existing);
      getDatabase().failNext('once', new Error('fail'));      
      return addDocument('myDB', 'foo', body, '1-abc').then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('fail');
      });
    });

    test('rejects if setting the entry in the database fails', () => {
      setInitialData(existing);
      getDatabase().failNext('set', new Error('fail'));      
      return addDocument('myDB', 'foo', body, '1-abc').then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('fail');
      });
    });

  });

  describe('deleteDocument', () => {

    const existing = {
      id: 'foo',
      rev: '1-abc',
      body: {
        three: 'delta',
        four: 'epsilon',
        five: 'omega',
      },
    };

    test('deletes the document from the database', () => {
      setInitialData(existing);
      return deleteDocument('myDB', 'foo', '1-abc').then(result => {
        expect(getDatabase().getData()).toMatchSnapshot();
      });
    });

    test('returns the deleted entry', () => {
      setInitialData(existing);
      return deleteDocument('myDB', 'foo', '1-abc').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('rejects deletes in case of revision conflicts', () => {
      setInitialData(existing);
      return deleteDocument('myDB', 'foo', '1-def').then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('Revision conflict: 1-abc');
      });
    });

    test('rejects if retrieving the current revision fails', () => {
      setInitialData(existing);
      getDatabase().failNext('once', new Error('fail'));      
      return deleteDocument('myDB', 'foo', '1-abc').then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('fail');
      });
    });

    test('rejects if setting the entry in the database fails', () => {
      setInitialData(existing);
      getDatabase().failNext('set', new Error('fail'));      
      return deleteDocument('myDB', 'foo', '1-abc').then(result => {
        fail('should have been rejected');
      }).catch(error => {
        expect(error.message).toBe('fail');
      });
    });

  });

});
