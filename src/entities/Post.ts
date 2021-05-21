import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

//is an object type and entity
@ObjectType() //convert class to object type
@Entity()
export class Post {
  //corresponds to tables
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  upDateAt? = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}

// @field for when you want to expose properties
