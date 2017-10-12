jest.unmock('../documentService');

import { Store } from '../../store/store';
import { calculateRevisionId } from '../../util/revisions';
import { DocumentService } from '../documentService';

describe('DocumentService', () => {

  const allDocuments = jest.fn();
  const document = jest.fn();
  const setDocument = jest.fn();
  const mockStore: Store = { allDocuments, document, setDocument };
  const documentService = new DocumentService(mockStore);

  beforeEach(() => {
    jest.resetAllMocks();
    (calculateRevisionId as jest.Mock<any>).mockReturnValue('5-xyz');
  });

  describe('allDocuments', () => {

    test('obtains a list of all documents in the store', () => {
      const documents = [{
        id: 'foo',
        rev: '1-abc',
        body: {
          one: 'alpha',
          two: 'beta',
          three: 'gamma',
        },
      },
      {
        id: 'bar',
        rev: '2-def',
        body: {
          three: 'delta',
          four: 'epsilon',
          five: 'omega',
        },
      }];
      allDocuments.mockReturnValueOnce(Promise.resolve(documents));
      return documentService.allDocuments('mydb').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('obtains an empty list if the store is empty', () => {
      allDocuments.mockReturnValueOnce(Promise.resolve([]));
      return documentService.allDocuments('mydb').then(result => {
        expect(result).toEqual([]);
      });
    });

    test('rejects if retrieving the data from the store fails', () => {
      const expectedError = new Error('fail');
      allDocuments.mockReturnValueOnce(Promise.reject(expectedError));
      return documentService.allDocuments('mydb')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });
  });

  describe('document', () => {

    test('retrieves the document with given id from the store', () => {
      document.mockReturnValueOnce(Promise.resolve({
        id: 'foo',
        rev: '1-abc',
        body: {
          one: 'alpha',
          two: 'beta',
          three: 'gamma',
        },
      }));
      return documentService.document('mydb', 'foo').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('rejects if the document could not be found', () => {
      const expectedError = new Error('Not found');
      document.mockReturnValueOnce(Promise.resolve(undefined));
      return documentService.document('mydb', 'foo')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toEqual(expectedError));
    });

    test('rejects if retrieving the document fails', () => {
      const expectedError = new Error('fail');
      document.mockReturnValueOnce(Promise.reject(expectedError));
      return documentService.document('mydb', 'foo')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toEqual(expectedError));
    });
  });

  describe('addDocument', () => {

    const newDocument = {
      one: 'alpha',
      two: 'beta',
      three: 'gamma',
    };
    const newDocumentBody = JSON.stringify(newDocument);

    test('adds a new document to the store', () => {
      document.mockReturnValueOnce(Promise.resolve(undefined));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody).then(result => {
        expect(setDocument).toBeCalledWith('mydb', {
          id: 'foo',
          body: newDocument,
          rev: '5-xyz',
        });
      });
    });

    // tslint:disable-next-line:max-line-length
    test('updates an existing document in the store if the provided rev matches the one of the document in the store', () => {
      document.mockReturnValueOnce(Promise.resolve({ rev: '1-abc' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody, '1-abc').then(result => {
        expect(setDocument).toBeCalledWith('mydb', {
          id: 'foo',
          body: newDocument,
          rev: '5-xyz',
        });
      });
    });

    test('returns the newly added revision', () => {
      document.mockReturnValueOnce(Promise.resolve({ rev: '1-abc' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody, '1-abc').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('calculates the initial revision Id if no revision is provided', () => {
      document.mockReturnValueOnce(Promise.resolve(undefined));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody).then(result => {
        expect(calculateRevisionId).toBeCalledWith(newDocumentBody, undefined);
      });
    });

    test('calculates the next revision Id based on the document body and the previous revision', () => {
      document.mockReturnValueOnce(Promise.resolve(undefined));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody, '1-abc').then(result => {
        expect(calculateRevisionId).toBeCalledWith(newDocumentBody, '1-abc');
      });
    });

    // tslint:disable-next-line:max-line-length
    test('rejects with a revision conflict error if the rev of the document in the store does not match the provided rev', () => {
      const expectedError = new Error('Revision conflict: 2-def');
      document.mockReturnValueOnce(Promise.resolve({ rev: '2-def' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody, '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toEqual(expectedError));
    });

    test('rejects if the current document could not be retrieved from the store', () => {
      const expectedError = new Error('fail');
      document.mockReturnValueOnce(Promise.reject(expectedError));
      return documentService.addDocument('mydb', 'foo', newDocumentBody, '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });

    test('rejects if document could not be set in the store', () => {
      const expectedError = new Error('fail');
      document.mockReturnValueOnce(Promise.resolve(undefined));
      setDocument.mockReturnValueOnce(Promise.reject(expectedError));
      return documentService.addDocument('mydb', 'foo', newDocumentBody, '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });

    test('rejects updates if the rev parameter is omitted', () => {
      const expectedError = new Error('Revision conflict: 2-def');
      document.mockReturnValueOnce(Promise.resolve({ rev: '2-def' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.addDocument('mydb', 'foo', newDocumentBody)
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toEqual(expectedError));
    });
  });

  describe('deleteDocument', () => {

    test('deletes a document from the store', () => {
      document.mockReturnValueOnce(Promise.resolve({ rev: '1-abc' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.deleteDocument('mydb', 'foo', '1-abc').then(result => {
        expect(setDocument).toBeCalledWith('mydb', {
          id: 'foo',
          rev: '5-xyz',
          deleted: true,
        });
      });
    });

    test('returns the delete revision', () => {
      document.mockReturnValueOnce(Promise.resolve({ rev: '1-abc' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.deleteDocument('mydb', 'foo', '1-abc').then(result => {
        expect(result).toMatchSnapshot();
      });
    });

    test('calculates the revision id of the delete revision', () => {
      document.mockReturnValueOnce(Promise.resolve({ rev: '1-abc' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.deleteDocument('mydb', 'foo', '1-abc').then(result => {
        expect(calculateRevisionId).toBeCalledWith('', '1-abc');
      });
    });

    test('rejects with a not found error if the document could not be found', () => {
      const expectedError = new Error('Not found');
      document.mockReturnValueOnce(Promise.resolve(undefined));
      return documentService.deleteDocument('mydb', 'foo', '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toEqual(expectedError));
    });

    // tslint:disable-next-line:max-line-length
    test('rejects with a revision conflict error if the rev of the document in the store does not match the provided rev', () => {
      const expectedError = new Error('Revision conflict: 2-def');
      document.mockReturnValueOnce(Promise.resolve({ rev: '2-def' }));
      setDocument.mockReturnValueOnce(Promise.resolve());
      return documentService.deleteDocument('mydb', 'foo', '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toEqual(expectedError));
    });

    test('rejects if the current document could not be retrieved from the store', () => {
      const expectedError = new Error('fail');
      document.mockReturnValueOnce(Promise.reject(expectedError));
      return documentService.deleteDocument('mydb', 'foo', '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });

    test('rejects if document could not be set in the store', () => {
      const expectedError = new Error('fail');
      document.mockReturnValueOnce(Promise.resolve({ rev: '1-abc' }));
      setDocument.mockReturnValueOnce(Promise.reject(expectedError));
      return documentService.deleteDocument('mydb', 'foo', '1-abc')
        .then(result => fail('should have been rejected'))
        .catch(error => expect(error).toBe(expectedError));
    });
  });
});
