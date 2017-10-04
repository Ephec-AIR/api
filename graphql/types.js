const typeDefs = `
  scalar Date
  type Product {
    _id: ID!
    postalCode: String!
  }
  type User {
    _id: ID!
    username: String!
    email: String!
    product: Product
  }
  type Consumption {
    date: Date!
    consumption: Int!
    product: Product
  }
  type Query {
    products(token: String!): [Product]
    users(token: String!): [User]
    consumptions(token: String!): [Consumption]
    product(token: String!, product_id: ID!): Product
    user(token: String!, user_id: ID!): User
    user(token: String!, username: String!): User
    consumption(token: String!, product_id: ID!): Consumption
  }
  type Token {
    token: String!
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): Token
    login(email: String!, password: String!): Token
    updateUser(token: String!, user_id: ID!): Token
    unregister(email: String!, password: String!): String!
    addProduct(token: String!): Product
    updateProduct(token: String!): Product
    addConsumption(token: String!): Consumption
  }
  schema {
    query: Query
    mutation: Mutation
  }
`;

module.exports = typeDefs;
