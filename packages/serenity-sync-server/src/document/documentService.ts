import { DocumentResult } from '../schema';
import { Store } from '../store/store';
import { calculateRevisionId } from '../util/revisions';
import { DocumentRevision } from './document';

const prepareDocumentRevisionForTransport = (entry: DocumentRevision) =>
  ({ ...entry, body: JSON.stringify(entry.body) }) as DocumentResult;

export class DocumentService {

  private _store: Store;

  constructor(store: Store) {
    this._store = store;
  }

  allDocuments(databaseName: string): Promise<DocumentResult[]> {
    return this._store.allDocuments(databaseName)
      .then(documents => documents.map(document => prepareDocumentRevisionForTransport(document)));
  }

  document(databaseName: string, id: string): Promise<DocumentResult> {
    return this._store.document(databaseName, id).then(document => {
      if (document) {
        return prepareDocumentRevisionForTransport(document);
      }
      throw new Error('Not found');
    });
  }

  addDocument(databaseName: string, id: string, body: string, rev?: string) {
    return this._store.document(databaseName, id).then(currentDocument => {
      if (currentDocument) {
        if (currentDocument.rev !== rev) {
          throw new Error('Revision conflict: ' + currentDocument.rev);
        }
      }
      const newRevSequenceNumber = calculateRevisionId(body, rev);
      const newDocumentRevision: DocumentRevision = {
        id,
        rev: newRevSequenceNumber,
        body: JSON.parse(body),
      };
      return this._store.setDocument(databaseName, newDocumentRevision)
        .then(() => ({ ...newDocumentRevision, body }));
    });
  }

  deleteDocument(databaseName: string, id: string, rev: string): Promise<DocumentResult> {
    return this._store.document(databaseName, id).then(currentDocument => {
      if (!currentDocument) {
        throw new Error('Not found');
      }
      if (currentDocument.rev !== rev) {
        throw new Error('Revision conflict: ' + currentDocument.rev);
      }
      const newRevSequenceNumber = calculateRevisionId('', rev);
      const newDocumentRevision: DocumentRevision = {
        id,
        rev: newRevSequenceNumber,
        deleted: true,
      };
      return this._store.setDocument(databaseName, newDocumentRevision)
        .then(() => newDocumentRevision);
    });
  }
}
