import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const typeDefs = `#graphql

  type Query {
    books: [Book]
    users: [User]
  }

  type Mutation {
    addBook(newBook: AddBookInput): Book
    addUser(newUser: AddUserInput): User
    deleteBook(id: Int): Book
  }
  type Book {
    id: Int
    description: String
    title: String
    author: User
  }
  type User {
    id: Int
    email: String
    name: String
    books: [Book]
  }
  input AddBookInput {
    title: String
    published: Boolean
    authorId: Int
    description: String
  }
  input AddUserInput{
    email: String
    name: String
  }
`;
const resolvers = {
  Query: {
    books: async () => await prisma.book.findMany({ include: {author: true}}),
    users: async ()=> await prisma.user.findMany()
  },
  Mutation: {
    addBook: async (parent, args, ctx) => await prisma.book.create({
      data: {
        title: args.newBook.title,
        description: args.newBook.description,
        published: args.newBook.published,
        author: {
          connect: {
            id: args.newBook.authorId
          }
        }
      },
      include:{
        author:true
      }
    }),
    deleteBook: async (parent, args, ctx)=> await prisma.book.delete({
      where: {id: args.id},
      include:{
        author:true
      }
    }),
    addUser: async (parent, args, ctx) => await prisma.user.create({
      data: args.newUser
    }),
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);

