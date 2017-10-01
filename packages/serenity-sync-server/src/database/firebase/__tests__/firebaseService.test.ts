jest.unmock('../firebaseService');

import * as firebase from 'firebase-admin';
import { documents } from '../firebaseService';

describe('Firebase Service', () => {

  describe('documents', () => {

    beforeEach(() => {
      (firebase as any).__clear();
    });

    test('obtains a list of documents from the firebase', () => {
      (firebase as any).__setMockData({
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
          }
        }
      });
      return documents('myDB').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('obtains an empty list if the database is empty', () => {
      (firebase as any).__setMockData({});
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
      (firebase.database().ref() as any).failNext('once', expectedError);
      return documents('myDB').then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });
  });

  // describe('documentByID', () => {

  // });

  // describe('addDocument', () => {

  // });

  // describe('deleteDocument', () => {

  // });

});
