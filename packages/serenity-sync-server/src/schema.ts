import { buildSchema } from 'graphql';
import { DocumentService } from './document/documentService';

export const schema = buildSchema(`

type Document {
  id: ID!
  rev: String
  body: String
}

type DocumentMutationResult {
  id: ID!
  rev: String
}

type Database {
  documents: [Document]
  document(id: ID!): Document!
}

input DatabaseInput {
  name: String!
}

type Query {
  database(name: String!): Database
}

type Mutation {
  addDocument(database: DatabaseInput, id: ID!, body: String!, rev: String): DocumentMutationResult
  deleteDocument(database: DatabaseInput, id: ID!, rev: String!): DocumentMutationResult
}

schema {
  query: Query
  mutation: Mutation
}

`);

export interface DocumentResult {
  id: string;
  rev: string;
  body?: string;
  deleted?: boolean;
}

interface DatabaseInputParam {
  name: string;
}

interface AddDocumentInputParams {
  database: DatabaseInputParam;
  id: string;
  body: string;
  rev?: string;
}

interface DeleteDocumentInputParams {
  database: DatabaseInputParam;
  id: string;
  rev: string;
}

export const createSchemaRoot = (documentService: DocumentService) => ({
  database: ({ name }: { name: string }) => ({
    documents: documentService.allDocuments(name),
    document: ({ id }: { id: string }) => documentService.document(name, id),
  }),
  addDocument: ({ database, id, body, rev }: AddDocumentInputParams) => 
    documentService.addDocument(database.name, id, body, rev),
  deleteDocument: ({ database, id, rev }: DeleteDocumentInputParams) => 
    documentService.deleteDocument(database.name, id, rev),
});
