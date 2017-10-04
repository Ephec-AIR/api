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
      return Product.find({});
    },
    users(root, data) {

    },
    consumptions(root, data) {

    },
    product(root, data) {

    },
    user(root, data) {

    },
    consumption(root, data) {

    }
  },
  Mutation: {
    register(root, data) {
      // return token
      return register(data).catch(err => console.error(err));
    },
    login(root, data) {
      // return token
      return login(data).catch(err => console.error(err));
    },
    updateUser(root, data) {

    },
    unregister(root, data) {
      // delete user, send back confirmation message
      return unregister(data).catch(err => console.error(err));
    },
    addProduct(root, data) {

    },
    updateProduct(root, data) {

    },
    addConsumption(root, data) {

    }
  }
}

module.exports = resolvers;
