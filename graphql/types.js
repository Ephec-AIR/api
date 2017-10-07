const typeDefs = `
  scalar Date
  type User {
    userId: ID
    product: Product
  }
  type Consumption {
    _id: ID
    date: Date
    value: Int
  }
  type Product {
    _id: ID
    serial: String
    secret: String
    token: String
    postalCode: Int
    consumption(limit: Int): [Consumption]
  }
  type Token {
    token: String!
  }
  type Query {
    consumptions: [Consumption]
    product(serial: String!, token: String!): Product
  }
  type Mutation {
    login(email: String!, password: String!): Token
    updateProduct(productId: String!, postalCode: Int!): Product
    addConsumption(serial: String!, token: String!, date: Date, value: Int!, productId: String!): Consumption
  }
  schema {
    query: Query
    mutation: Mutation
  }
`;

module.exports = typeDefs;
