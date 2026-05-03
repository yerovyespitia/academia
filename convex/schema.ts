import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  classes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    code: v.string(),
    description: v.string(),
    topics: v.array(v.string()),
    order: v.number(),
    hasProgram: v.boolean(),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_code", ["userId", "code"]),
  documents: defineTable({
    userId: v.id("users"),
    classId: v.id("classes"),
    title: v.string(),
    type: v.union(v.literal("image"), v.literal("audio"), v.literal("pdf")),
    content: v.string(),
    originalFileName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_classId", ["userId", "classId"]),
});

export default schema;
