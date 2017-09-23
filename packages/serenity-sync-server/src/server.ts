import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { schema, root } from './schema';

const port = 3000;

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(port);
