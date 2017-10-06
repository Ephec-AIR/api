const Product = require('./models/Product');
const User = require('./models/User');
const Consumption = require('./models/Consumption');

const serial = 'e2d36-022e2-ab182-f42e2-806fa';
const secret = 'pommepoire';
const token = 'dab035674b6e91e2395b471b4cdf6bba558580bb';

const product = {
  serial,
  secret,
  token,
  postalCode: '10000'
};

const consumptions = [
  {
    date: new Date(2017, 10, 6, 12),
    value: 300,
    productId: 0
  },{
    date: new Date(2017, 10, 6, 13),
    value: 350,
    productId: 0
  },{
    date: new Date(2017, 10, 6, 14),
    value: 400,
    productId: 0
  },{
    date: new Date(2017, 10, 6, 15),
    value: 450,
    productId: 0
  }
];

Product.insertMany(product).then(docs => {
  const cs = consumptions.map(c => c.productId = docs[0]._id);
  Consumption.insertMany(cs).then(() => process.exit(0));
}).catch(err => console.error(err));
