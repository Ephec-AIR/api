const {
  GraphQLDate
} = require('graphql-iso-date');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const {login} = require('../authentication');

const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const resolvers = {
  Date: GraphQLDate,
  Query: {
    consumptions(root, data) {
      // list of consumptions
      return consumptions.find({});
    },
    async product(root, {serial, token}) {
      // single product
      const product = await Product.findOne({serial, token});
      if (!product) {
        return "Ce produit n'existe pas ou vous en n'avez pas l'autorisation d'utilisation !";
      }
      return product;
    }
  },
  Mutation: {
    async login(root, data) {
      const token = await login(data).catch(err => console.error(err));
      return token;
    },
    async updateProduct(root, {productId, postalCode}) {
      const product = await Product.findById(mongoose.Types.ObjectId(productId));
      product.postalCode = postalCode;
      return await product.save();
    },
    async addConsumption(root, {serial, token, date, value}) {
      // verify authorization
      const product = await Product.findOne({serial, token});
      if (!product) {
        return "Ce produit n'existe pas ou vous en n'avez pas l'autorisation d'utilisation !";
      }
      // add consumption for a product
      const consumption = await new Consumption({
        date,
        value,
        productId: product._id
      }).save();
      return consumption;
    }
  },
  Product: {
    async consumption({_id}, {limit}) {
      return await Consumption.find({productId: _id}).sort({date: -1}).limit(limit);
    }
  }
}

module.exports = resolvers;
