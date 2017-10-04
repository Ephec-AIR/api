const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const schema = require('./graphql/schema');
const jwt = require('./middlewares/jwt');
const app = express();

const PORT = process.env.PORT || 3000;
const production = process.env.NODE_ENV === 'production';

app.use(passport.initialize());
app.use(bodyParser.json());
app.use('/graphql',
  graphqlExpress(req => ({
    schema,
    context: {
      user: req.user
    },
    pretty: true
  }))
);

if (!production) {
  app.use('/graphql-ui', graphiqlExpress({endpointURL: '/graphql'}));
}

http.createServer(app).listen(PORT, _ => {
  console.log(`listening on http://localhost:${PORT}`);
});
