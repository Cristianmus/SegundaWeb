const { gql } = require("apollo-server");

const typeDefs = gql`
  type Room {
    id: ID!
    name: String!
    type: String!
    pricePerNight: Float!
    features: [String]
    availability: Boolean!
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: String!
  }

  type Booking {
    id: ID!
    customer: Customer!
    room: Room!
    startDate: String!
    endDate: String!
    nights: Int!
    totalPrice: Float!
    status: String!
  }

  type Query {
    rooms(type: String, minPrice: Float, maxPrice: Float): [Room]
    customers: [Customer]
    bookings(status: String): [Booking]
  }

  type Mutation {
    createRoom(name: String!, type: String!, pricePerNight: Float!, features: [String]): Room
    createCustomer(name: String!, email: String!, phone: String!): Customer
    createBooking(customerId: ID!, roomId: ID!, startDate: String!, endDate: String!): Booking
    updateBooking(bookingId: ID!, status: String!): Booking
    deleteBooking(bookingId: ID!): String
  }
`;

module.exports = typeDefs;
