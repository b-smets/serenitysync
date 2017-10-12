import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { DocumentService } from './document/documentService';
import { createSchemaRoot, schema } from './schema';
import { FirebaseStore } from './store/firebase/firebaseStore';

const documentService = new DocumentService(new FirebaseStore());
const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: createSchemaRoot(documentService),
  graphiql: true,
}));

app.listen(3000);
