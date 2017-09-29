const http = require('http');
const express = require('express');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const bodyParser = require('body-parser');
const schema = require('./graphql/schema');
const app = express();

const PORT = process.env.PORT || 3000;
const production = process.env.NODE_ENV === 'production';

app.use(bodyParser.json());

app.use('/graphql', graphqlExpress({
  schema,
  pretty: true
}));

app.use('/graphql-ui', graphiqlExpress({endpointURL: '/graphql'}));

http.createServer(app).listen(PORT, _ => {
  console.log(`listening on http://localhost:${PORT}`);
});
