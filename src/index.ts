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
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

// top level await for promise
const main = async () => {
  const orm = await MikroORM.init(microConfig);

  //  run migrations
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  redisClient.on("error", function (err) {
    console.log("Error " + err);
  });

  // arrgement matters, need to come before middleware
  app.use(
    //sessions for auth using redis
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        host: "localhost",
        port: 6379,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10years
        httpOnly: true, //cookie cant be accessed in our front end
        secure: _prod_, // cookie only works in https
        sameSite: "lax", //csrfnpm
      },
      saveUninitialized: false,
      secret: "lkjkhkhkkhkhkhkhklohoihlholihoih",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),

    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }), //   used/accessible by all resolvers
  });

  apolloServer.applyMiddleware({ app }); //create graphql endpoint on express

  app.listen(3000, () => console.log("server started on port 3000"));

  console.log(_prod_);

  //   create post table
  //   const post = orm.em.create(Post, { title: "my first post" });
  //   await orm.em.persistAndFlush(post); //persist to db

  //   const posts = await orm.em.find(Post, {});
  //   console.log(posts);
};

main().catch((e) => console.log(e));
