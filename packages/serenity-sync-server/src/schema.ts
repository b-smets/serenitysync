import { buildSchema } from 'graphql';
import { documents, documentByID, addDocument } from './database/firebase/firebaseService';

export interface DocumentResult {
  id: string;
  rev: string;
  body: string;
}

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

type Query {
  documents: [Document]
  document(id: ID!): Document!
}

type Mutation {
  addDocument(id: ID!, body: String!, rev: String): DocumentMutationResult
}

schema {
  query: Query
  mutation: Mutation
}
`);

export const root = {
  documents,
  document: ({ id }: { id: string }) => documentByID(id),

  addDocument: ({ id, body, rev }: { id: string, body: string, rev?: string }) => addDocument(id, body, rev),
};
