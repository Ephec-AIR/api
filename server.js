// Server entrypoint

const http = require('http');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const catchErrors = require('./middlewares/errors');
const {parseJWT, onlyAdmin, doUserOwn, onlyActiveOCR, onlySyncedUser} = require('./middlewares/authorizations');
const {requireFields} = require('./middlewares/validator');
const {login, sync} = require('./controllers/auth');
const {addConsumtion, getConsumption} = require('./controllers/consumption');
const {createProduct, setPostalCode} = require('./controllers/product');
const app = express();

const PORT = process.env.PORT || 3000;
const production = process.env.NODE_ENV === 'production';

// middlewares
app.use(bodyParser.json());
app.use(cookieParser()); // à voir si on en a besoin
app.use(validator());

// REST
app.get('/health', (req, res) => res.send('server ok.\n'));
app.post('/login', requireFields("username", "password"), catchErrors(login));
app.post('/sync', parseJWT, requireFields("serial", "user_secret"), catchErrors(doUserOwn), catchErrors(sync));
app.put('/consumption', requireFields("ocr_secret", "serial", "value"), catchErrors(onlyActiveOCR), catchErrors(addConsumtion));
app.get('/consumption', parseJWT, onlySyncedUser, catchErrors(getConsumption));
app.post('/product', parseJWT, onlyAdmin, catchErrors(createProduct));
app.put('/product', parseJWT, onlySyncedUser, catchErrors(setPostalCode));

let HTTPServer = http.createServer(app);
HTTPServer.listen(PORT, _ => {
  console.log(`listening on http://localhost:${PORT}`);
});

module.exports = {
  app,
  HTTPServer
}
