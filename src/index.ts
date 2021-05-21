// import { Post } from "./entities/Posts";
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// top level await for promise
const main = async () => {
  const orm = await MikroORM.init(microConfig);

  //  run migrations
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),

    context: () => ({ em: orm.em }), //   used/accessible by all resolvers
  });

  apolloServer.applyMiddleware({ app }); //create graphql endpoint on express

  app.listen(3000, () => console.log("server started on port 3000"));

  //   create post table
  //   const post = orm.em.create(Post, { title: "my first post" });
  //   await orm.em.persistAndFlush(post); //persist to db

  //   const posts = await orm.em.find(Post, {});
  //   console.log(posts);
};

main().catch((e) => console.log(e));
