const {
  GraphQLDate
} = require('graphql-iso-date');

const {register, login, unregister} = require('../authentication');

const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const resolvers = {
  Date: GraphQLDate,
  Query: {
    products() {
      // list of products
      return Product.find({});
    },
    users(root, data) {
      // list of users
      return User.find({});
    },
    consumptions(root, data) {
      // list of consumptions
      return consumptions.find({});
    },
    product(root, {productId}) {
      // single product
      return Product.findById(mongoose.Types.ObjectId(productId));
    },
    user(root, {userId}) {
      // single user
      return User.findById(mongoose.Types.ObjectId(userId));
    },
    consumption(root, {productId}) {
      // list of consumptions (delta ?) belonging to a product
      return Consumption.find({productId: mongoose.Types.ObjectId(productId)});
    }
  },
  Mutation: {
    register(root, {username, email, password}) {
      // return token
      return register(username, email, password).catch(err => console.error(err));
    },
    login(root, {email, password}) {
      // return token
      return login(email, password).catch(err => console.error(err));
    },
    updateUser(root, data) {

    },
    unregister(root, {email, password}) {
      // delete user, send back confirmation message
      return unregister(email, password).catch(err => console.error(err));
    },
    async addProduct(root, {postalCode}) {
      const product = await new Product({
        postalCode
      }).save();
      return product;
    },
    async updateProduct(root, {productId, postalCode}) {
      const product = await Product.findById(mongoose.Types.ObjectId(productId));
      product.postalCode = postalCode;
      return await product.save();
    },
    async addConsumption(root, {date, value, productId}) {
      // add consumption for a product
      const consumption = await new Consumption({
        date,
        value,
        productId: mongoose.Types.ObjectId(productId)
      }).save();
      return consumption;
    }
  }
}

module.exports = resolvers;
