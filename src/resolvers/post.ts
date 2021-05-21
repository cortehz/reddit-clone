import { MyContext } from "./../types";
import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
  //get all posts
  @Query(() => [Post])
  posts(@Ctx() ctx: MyContext): Promise<Post[]> {
    //return the context type and explicitly set post type as well fo graphQl and TS
    return ctx.em.find(Post, {});
  }

  //   get single post
  @Query(() => Post, { nullable: true }) //type-graphql type
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() ctx: MyContext
  ): Promise<Post | null> {
    //return the context type and explicitly set post type as well fo graphQl and TS
    return ctx.em.findOne(Post, { id });
  }

  @Mutation(() => Post) //type-graphql type
  async createPost(
    @Arg("title") title: string,
    @Ctx() ctx: MyContext
  ): Promise<Post> {
    const post = ctx.em.create(Post, { title });
    await ctx.em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true }) //type-graphql type
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string, // when ypu want a field to be nullable
    @Ctx() ctx: MyContext
  ): Promise<Post | null> {
    const post = await ctx.em.findOne(Post, { id });
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await ctx.em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean) //type-graphql type
  async deletePost(
    @Arg("id") id: number,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    await ctx.em.nativeDelete(Post, { id });
    return true;
  }
}
