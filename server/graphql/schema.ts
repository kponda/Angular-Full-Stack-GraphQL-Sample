import Cat from '../models/cat';
import { makeExecutableSchema } from 'graphql-tools';

// The GraphQL schema in string form
const typeDefs = `
  type Query {
     cats: [Cat]
  }

  type Mutation {
    addCat(name: String!, age: Int!, weight: Float!): Cat
    updateCat(id: String!, name: String!, age: Int!, weight: Float!): Cat
    removeCat(id: String!): Cat
  }

  type Cat { _id: String, name: String, age: Int, weight: Float}
`;

// The resolvers
const resolvers = {
  Query: { 
    cats: async () => allCats(),
    cat: async (_, args) => findCat(args.id),
  },
  Mutation: {
    addCat: async (_, args) => insertCat(args.name, args.age, args.weight),
    updateCat: async (_, args) => updateCat(args.id, args.name, args.age, args.weight),
    removeCat: async (_, args) => removeCat(args.id)
  }
};

// Put together a schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

async function allCats() {
  return await Cat.find();
}

async function findCat(id: string) {
  return await Cat.findOne({ _id: id });
}

async function insertCat(name: string, age: number, weight: number) {
  let cat = new Cat();
  cat.name = name;
  cat.age = age;
  cat.weight = weight;
  return await cat.save();
}

async function updateCat(id: string, name: string, age: number, weight: number) {
  let cat = await findCat(id);
  console.log(cat);
  cat.name = name;
  cat.age = age;
  cat.weight = weight;
  console.log(cat);
  return await cat.save();
}

async function removeCat(id: string) {
  return await Cat.findOneAndRemove({_id: id});
}