const http = require('http');
const url = require('url');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const validator = require('express-validator');
const catchErrors = require('./middlewares/errors');
const {parseJWT, onlyAdmin, doUserOwn, onlyActiveOCR, onlySyncedUser, onlyUpdatedUser} = require('./middlewares/authorizations');
const {requireFields, requireQuery} = require('./middlewares/validator');
const {login, sync, admin} = require('./controllers/auth');
const {addConsumtion, getConsumption, match} = require('./controllers/consumption');
const {createProduct, update} = require('./controllers/product');
const {tip, events} = require('./controllers/tips');
const app = express();

const PORT = process.env.PORT || 3000;
const production = process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) {
      cb(null, false);
      return;
    }
    const u = url.parse(origin);
    cb(null, u.hostname == 'localhost' || u.hostname == '127.0.0.1');
  },
  allowedHeaders: ['Content-Type', 'Authorization']
};

// middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(validator());

// REST
app.get('/health', (req, res) => res.send('server ok.\n'));
app.post('/login', requireFields("username", "password"), catchErrors(login));
app.post('/sync', parseJWT, requireFields("serial", "user_secret"), catchErrors(doUserOwn), catchErrors(sync));
app.post('/consumption', requireFields("ocr_secret", "serial", "value"), catchErrors(onlyActiveOCR), catchErrors(addConsumtion));
app.get('/consumption', parseJWT, onlySyncedUser, requireQuery("start", "end", "type"), catchErrors(getConsumption));
app.post('/product', parseJWT, onlyAdmin, catchErrors(createProduct));
app.put('/product', parseJWT, onlySyncedUser, requireFields("postalCode", "supplier"), catchErrors(update));
app.put('/admin', parseJWT, onlyAdmin, requireFields("username", "admin"), catchErrors(admin));
app.get('/match', parseJWT, onlySyncedUser, onlyUpdatedUser, requireQuery("start", "end", "type"), catchErrors(match));
app.get('/tip', catchErrors(tip));
app.get('/events', catchErrors(events));
let HTTPServer = http.createServer(app);
HTTPServer.listen(PORT, _ => {
  console.log(`listening on http://localhost:${PORT}`);
});

module.exports = {
  app,
  HTTPServer
}
