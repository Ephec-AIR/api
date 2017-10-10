const http = require('http');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const catchErrors = require('./middlewares/errors');
const {jwt, admin, ocr} = require('./middlewares/authorizations');
const {validateLogin, validateSync} = require('./middlewares/validators');
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
app.post('/login', validateLogin, catchErrors(login));
app.post('/sync', validateSync, jwt, catchErrors(sync));
app.put('/consumption', catchErrors(addConsumtion));
app.get('/consumption', catchErrors(getConsumption));
app.post('/product', jwt, admin, catchErrors(createProduct));
app.put('/product', jtw, catchErrors(setPostalCode));

http.createServer(app).listen(PORT, _ => {
  console.log(`listening on http://localhost:${PORT}`);
});

module.exports = app;
