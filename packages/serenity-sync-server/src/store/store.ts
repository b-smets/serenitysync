import { DocumentRevision } from '../document/document';

export interface Store {
  allDocuments(databaseName: string): Promise<DocumentRevision[]>;
  document(databaseName: string, id: string): Promise<DocumentRevision | undefined>;
  setDocument(databaseName: string, document: DocumentRevision): Promise<void>;
}
