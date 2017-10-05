const typeDefs = `
  scalar Date
  type Product {
    _id: ID!
    postalCode: Int!
  }
  type User {
    _id: ID!
    username: String!
    email: String!
    product: Product
  }
  type Consumption {
    date: Date!
    value: Int!
    product: Product
  }
  type Token {
    token: String!
  }
  type Query {
    products: [Product]
    users: [User]
    consumptions: [Consumption]
    product(productId: ID!): Product
    user(userId: ID!): User
    user(username: String!): User
    consumption(productId: ID!): Consumption
  }
  type Mutation {
    login(email: String!, password: String!): Token
    updateProduct(postalCode: Int!): Product
    addConsumption(date: Date, value: Int!, productId: String!): Consumption
  }
  schema {
    query: Query
    mutation: Mutation
  }
`;

module.exports = typeDefs;
