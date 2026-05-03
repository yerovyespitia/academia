import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const [documents, classes] = await Promise.all([
      ctx.db
        .query("documents")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("classes")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    const classesById = new Map(
      classes.map((classItem) => [classItem._id, classItem]),
    );

    return documents
      .map((document) => {
        const classItem = classesById.get(document.classId);

        return {
          ...document,
          className: classItem?.name ?? "Sin clase",
          preview: document.content.slice(0, 220),
          wordCount: document.content.trim().split(/\s+/).filter(Boolean)
            .length,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    classId: v.id("classes"),
    title: v.string(),
    type: v.union(v.literal("image"), v.literal("audio"), v.literal("pdf")),
    content: v.string(),
    originalFileName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const classItem = await ctx.db.get(args.classId);

    if (!classItem || classItem.userId !== userId) {
      throw new Error("Invalid class");
    }

    const now = Date.now();

    return await ctx.db.insert("documents", {
      userId,
      classId: args.classId,
      title: args.title,
      type: args.type,
      content: args.content,
      originalFileName: args.originalFileName,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.get(args.id);

    if (!document || document.userId !== userId) {
      throw new Error("Document not found");
    }

    await ctx.db.delete(args.id);
  },
});
